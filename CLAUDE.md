# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vessel is a gasless stablecoin payment platform built on Lisk using ERC-4337 Account Abstraction. It enables one-click cross-border payments with auto-swap, gas sponsorship, and AI-driven routing. Built for the AWS Global 10,000 AIdeas Competition.

## Monorepo Structure

npm workspaces monorepo with four packages:

- **`packages/frontend`** — Next.js 16 app (React 19, Tailwind CSS 4, TypeScript). Landing page with GSAP/Three.js cinematic effects, wallet dashboard, payment flow, and QR scanning.
- **`packages/backend`** — AWS Lambda functions (TypeScript). Payment orchestrator, webhook handler, and AI agent. Compiled to CommonJS (`dist/`).
- **`packages/contracts`** — Solidity smart contracts (Hardhat 3). VesselPaymaster (ERC-4337), StableSwapAMM, PaymentProcessor, VesselAccountFactory. Target chain: Lisk Sepolia (chainId 4202).
- **`packages/infra`** — AWS CDK infrastructure (TypeScript). Defines DynamoDB tables, Lambda functions, API Gateway, Cognito, KMS, S3, CloudFront.

## Commands

### Root-level (run from repo root)
```bash
npm run dev                    # Start frontend dev server
npm run build                  # Build backend then frontend
npm run lint                   # Lint all workspaces
npm run test                   # Test all workspaces
npm run typecheck              # Typecheck all workspaces
npm run compile                # Compile Solidity contracts
npm run deploy:contracts:local # Deploy contracts to local Hardhat node
```

### Frontend (`packages/frontend`)
```bash
npm run dev                    # next dev
npm run build                  # next build
npm run test                   # vitest run
npm run test:watch             # vitest (watch mode)
npm run lint                   # eslint
npm run typecheck              # tsc --noEmit
```

### Contracts (`packages/contracts`)
```bash
npm run compile                # hardhat compile
npm run test                   # hardhat test
npm run test:coverage          # hardhat coverage
npm run node                   # hardhat node (local blockchain)
npm run deploy:local           # Deploy to localhost
npm run deploy:testnet         # Deploy to Lisk Sepolia
```

### Backend (`packages/backend`)
```bash
npm run build                  # tsc (outputs to dist/)
npm run typecheck              # tsc --noEmit
```

### Infra (`packages/infra`)
```bash
npm run build                  # tsc
npm run synth                  # cdk synth
npm run deploy                 # cdk deploy --all
npm run test                   # jest
```

## Architecture Details

### Frontend State Management
Zustand store with slice pattern. All slices combined in `src/store/index.ts` into a single `useAppStore`. Selector hooks (`useAuth`, `useWallet`, `useTransactions`, `useContacts`, `usePaymentLinks`, `useMultiChain`, `useAI`, `useUI`) use `useShallow` to prevent unnecessary re-renders. Store persists to localStorage under key `vessel-wallet-storage`.

### Frontend Key Patterns
- Path alias: `@/` maps to `src/`
- UI primitives in `src/components/ui/` (shadcn/ui pattern with Radix + CVA)
- Landing page components in `src/components/landing/` use GSAP ScrollTrigger and Three.js (via React Three Fiber) for cinematic 3D planet and scroll animations
- Smooth scrolling via Lenis (`src/components/smooth-scroll-provider.tsx`)
- Next.js API routes in `src/app/api/` handle auth, session keys, contacts, payment links, relay, paymaster, gas estimation, and ENS
- Contract addresses centralized in `src/lib/contract-addresses.ts` with per-chain config
- Tests use Vitest + jsdom + Testing Library (`src/test/setup.ts`)

### Backend Architecture
Single Lambda handler (`src/lambda/orchestrator.ts`) dispatches on `action` field in request body. Actions include: `sign_paymaster`, `submit_userop`, `create_payment`, `get_payment`, `create_merchant`, `store_session_key`, `fraud_score`, `route_recommendation`, etc. Libraries in `src/lib/` for DynamoDB operations, paymaster signing (KMS), and bundler communication.

### Smart Contracts
- Solidity 0.8.28 with optimizer enabled (200 runs), EVM version `cancun`
- Multiple compiler versions configured (0.8.28, 0.8.22, 0.8.21, 0.8.20) for dependency compatibility
- Uses OpenZeppelin contracts and `@account-abstraction/contracts`
- Contract tests: TypeScript tests (`.test.ts`) and Solidity Forge-style tests (`.t.sol`)
- Hardhat config in JS (`hardhat.config.js`), uses dotenv for `PRIVATE_KEY` and `LISK_RPC_URL`

### Infra (CDK Stack: `VesselStack`)
Provisions: KMS signing key, 4 DynamoDB tables (payments, merchants, users, session-keys), Cognito user pool with identity pool, 3 Lambda functions (orchestrator, webhook, ai-agent), API Gateway with Cognito authorizer, S3 buckets, CloudFront distribution, SNS alerts.

## Environment

- Node.js 20 (`.nvmrc`)
- Package manager: npm (with `package-lock.json`)
- Contracts require `.env` with `PRIVATE_KEY` and optionally `LISK_RPC_URL`
- Frontend uses `NEXT_PUBLIC_*` env vars for contract addresses and RPC URLs
