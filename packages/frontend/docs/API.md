# Vessel Wallet API Documentation

## Overview

Vessel Wallet provides a comprehensive REST API for managing smart wallet operations including session keys, ENS resolution, contacts, meta-transactions, and more.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.vesselwallet.io/api
```

## Authentication

All API endpoints use wallet-based authentication. Include the wallet address in the `X-Wallet-Address` header for authenticated requests.

```http
X-Wallet-Address: 0x...
```

---

## Session Keys

### List Session Keys

```http
GET /api/session-keys
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "publicKey": "0x1234...",
      "permissions": {
        "spendingLimit": "1000000000000000000",
        "chainIds": [1, 137]
      },
      "expiresAt": 1709827200000,
      "createdAt": 1709740800000,
      "remainingTime": 86400000
    }
  ]
}
```

### Create Session Key

```http
POST /api/session-keys
```

**Body:**
```json
{
  "permissions": {
    "spendingLimit": "1000000000000000000",
    "allowedContracts": ["0x..."],
    "allowedFunctions": ["0xa9059cbb"],
    "chainIds": [1, 137, 42161]
  },
  "durationMs": 604800000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "publicKey": "0x1234...",
    "permissions": {...},
    "expiresAt": 1709827200000,
    "createdAt": 1709740800000
  }
}
```

### Get Session Key

```http
GET /api/session-keys/:id
```

### Revoke Session Key

```http
DELETE /api/session-keys/:id
```

### Validate Session Key

```http
POST /api/session-keys/validate
```

**Body:**
```json
{
  "publicKey": "0x...",
  "transaction": {
    "to": "0x...",
    "value": "1000000000000000000",
    "data": "0x",
    "chainId": 1
  }
}
```

---

## ENS Resolution

### Resolve Name/Address

```http
POST /api/ens/resolve
```

**Body:**
```json
{
  "input": "vitalik.eth",
  "chainId": 1,
  "direction": "auto"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
  }
}
```

### Get ENS Profile

```http
GET /api/ens/profile?input=0x...&chainId=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "vitalik.eth",
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "avatar": "https://...",
    "twitter": "VitalikButerin",
    "github": "vbuterin"
  }
}
```

---

## Contacts

### List Contacts

```http
GET /api/contacts?sortBy=lastUsed&limit=20
```

### Create Contact

```http
POST /api/contacts
```

**Body:**
```json
{
  "address": "0x...",
  "name": "Alice",
  "tags": ["friend", "dao"],
  "notes": "Met at ETHGlobal"
}
```

### Update Contact

```http
PUT /api/contacts/:id
```

### Delete Contact

```http
DELETE /api/contacts/:id
```

---

## Meta-Transactions (Relay)

### Submit Transaction

```http
POST /api/relay/submit
```

**Body:**
```json
{
  "metaTransaction": {
    "from": "0x...",
    "to": "0x...",
    "value": "0",
    "data": "0x...",
    "nonce": 1,
    "deadline": 1709827200,
    "chainId": 1,
    "signature": "0x..."
  },
  "verifyingContract": "0x..."
}
```

### Get Transaction Status

```http
GET /api/relay/status?txId=xxx
```

---

## Paymaster

### Estimate Gas with Paymaster

```http
POST /api/paymaster/estimate
```

**Body:**
```json
{
  "transaction": {
    "from": "0x...",
    "to": "0x...",
    "value": "1000000000000000000",
    "data": "0x"
  },
  "chainId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nativeTokenCost": "0.005",
    "stablecoinCost": "12.50",
    "paymasterAvailable": true,
    "paymasterFee": "0.05"
  }
}
```

---

## Payment Links

### List Payment Links

```http
GET /api/payment-links?status=active
```

### Create Payment Link

```http
POST /api/payment-links
```

**Body:**
```json
{
  "amount": "1000000000000000000",
  "token": "ETH",
  "acceptedTokens": ["ETH", "USDC", "USDT"],
  "recipientAddress": "0x...",
  "description": "Invoice #123",
  "expiresAt": "2024-03-15T00:00:00Z",
  "maxUses": 1
}
```

### Get Payment Link

```http
GET /api/payment-links/:id
```

### Update Payment Link

```http
PUT /api/payment-links/:id
```

### Deactivate Payment Link

```http
DELETE /api/payment-links/:id?deactivate=true
```

---

## Gas Estimation

### Get Gas Estimates

```http
GET /api/gas/estimate?chainId=1&gasLimit=21000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chainId": 1,
    "chainName": "Ethereum",
    "nativeToken": "ETH",
    "nativeTokenPrice": 2500,
    "networkCongestion": "low",
    "recommended": "standard",
    "estimates": [
      {
        "level": "slow",
        "maxFeePerGas": "20000000000",
        "estimatedConfirmationTime": 300,
        "confidence": 95
      },
      {
        "level": "standard",
        "maxFeePerGas": "25000000000",
        "estimatedConfirmationTime": 60,
        "confidence": 85
      },
      {
        "level": "fast",
        "maxFeePerGas": "35000000000",
        "estimatedConfirmationTime": 30,
        "confidence": 75
      }
    ],
    "costEstimates": [
      {
        "level": "standard",
        "gasCost": "0.000525",
        "usdCost": "1.31"
      }
    ]
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Standard endpoints**: 100 requests/minute
- **Write endpoints**: 20 requests/minute
- **Gas estimation**: 30 requests/minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709740860
```

---

## Webhooks

Configure webhooks for real-time notifications:

```json
{
  "event": "transaction.confirmed",
  "data": {
    "txHash": "0x...",
    "chainId": 1,
    "timestamp": 1709740800
  }
}
```

Supported events:
- `session_key.created`
- `session_key.expired`
- `transaction.pending`
- `transaction.confirmed`
- `transaction.failed`
- `payment_link.used`
- `payment_link.expired`