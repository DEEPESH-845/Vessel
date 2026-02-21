# Vessel Deployment Guide

This document provides a comprehensive guide to deploying the Vessel application.

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- AWS CLI configured with appropriate credentials (for infrastructure deployment)
- Docker installed (for local development)

## Project Structure

```
vessel-monorepo/
├── packages/
│   ├── frontend/     # Next.js frontend application
│   ├── backend/      # AWS Lambda backend
│   ├── contracts/    # Solidity smart contracts
│   └── infra/        # AWS CDK infrastructure
└── package.json      # Root monorepo configuration
```

## Available Scripts

### Root Level Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build all packages |
| `npm run build:frontend` | Build only the frontend |
| `npm run build:backend` | Build only the backend |
| `npm run build:contracts` | Compile smart contracts |
| `npm run lint` | Lint all packages |
| `npm run test` | Run tests across all packages |
| `npm run clean` | Remove all node_modules and build artifacts |
| `npm run compile` | Compile smart contracts |
| `npm run typecheck` | Run TypeScript type checking |

### Deployment Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy:contracts:local` | Deploy contracts to local Hardhat network |
| `npm run deploy:contracts:testnet` | Deploy contracts to Sepolia testnet |
| `npm run deploy:contracts:mainnet` | Deploy contracts to Ethereum mainnet |
| `npm run deploy:infra` | Deploy AWS infrastructure |
| `npm run deploy:frontend` | Build frontend for deployment |
| `npm run deploy` | Full deployment (contracts + infra + frontend) |

## Deployment Workflow

### 1. Smart Contracts Deployment

```bash
# Local development
npm run compile                    # Compile contracts
npm run deploy:contracts:local     # Deploy to local network

# Testnet deployment
npm run deploy:contracts:testnet   # Deploy to Sepolia

# Mainnet deployment
npm run deploy:contracts:mainnet   # Deploy to mainnet
```

**Required Environment Variables** (create `.env` in `packages/contracts/`):
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. AWS Infrastructure Deployment

```bash
# First-time setup (bootstrap CDK)
npm run bootstrap --workspace=packages/infra

# Preview changes
npm run synth --workspace=packages/infra
npm run diff --workspace=packages/infra

# Deploy
npm run deploy:infra
```

**Required Setup**:
1. Configure AWS CLI: `aws configure`
2. Bootstrap CDK (first time only): `npm run bootstrap --workspace=packages/infra`

### 3. Frontend Deployment

The frontend can be deployed to various platforms:

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd packages/frontend && vercel
```

#### Docker
```bash
cd packages/frontend
docker-compose up --build
```

#### Static Export
```bash
npm run build:frontend
# Output will be in packages/frontend/out
```

## Individual Package Scripts

### Frontend (`packages/frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run typecheck` | TypeScript type check |
| `npm run clean` | Clean build artifacts |

### Backend (`packages/backend/`)

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run build:watch` | Watch mode compilation |
| `npm run typecheck` | TypeScript type check |
| `npm run clean` | Clean build artifacts |

### Contracts (`packages/contracts/`)

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile Solidity contracts |
| `npm run clean` | Clean Hardhat cache and artifacts |
| `npm run test` | Run contract tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run node` | Start local Hardhat node |
| `npm run deploy:local` | Deploy to local network |
| `npm run deploy:testnet` | Deploy to Sepolia |
| `npm run deploy:mainnet` | Deploy to mainnet |
| `npm run typecheck` | TypeScript type check |

### Infrastructure (`packages/infra/`)

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run synth` | Synthesize CloudFormation template |
| `npm run diff` | Compare deployed stack with local |
| `npm run deploy` | Deploy to AWS |
| `npm run destroy` | Destroy AWS stack |
| `npm run bootstrap` | Bootstrap CDK (first-time setup) |
| `npm run list` | List all stacks |
| `npm run typecheck` | TypeScript type check |
| `npm run clean` | Clean build artifacts |

## Environment Variables

### Frontend (`.env.local` in `packages/frontend/`)
```
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
NEXT_PUBLIC_AUTH0_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Backend (`.env` in `packages/backend/`)
```
AWS_REGION=us-east-1
LAMBDA_FUNCTION_NAME=vessel-orchestrator
```

### Contracts (`.env` in `packages/contracts/`)
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## CI/CD Pipeline

For automated deployments, consider setting up a CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm run deploy:contracts:testnet
      - run: npm run deploy:infra
      - run: npm run deploy:frontend
```

## Troubleshooting

### Common Issues

1. **npm install fails**: Try `npm run clean` and then `npm install` again
2. **Hardhat compilation errors**: Check Solidity version compatibility
3. **CDK deployment fails**: Ensure AWS credentials are configured correctly
4. **Frontend build fails**: Check for missing environment variables

### Getting Help

- Check the individual package README files
- Review the architecture documentation in `packages/frontend/docs/`
- Open an issue on GitHub

## License

ISC