<div align="center">

# 🚢 Vessel

### Next-Generation Web3 Wallet with Account Abstraction

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-3.1.9-yellow?style=for-the-badge&logo=ethereum)](https://hardhat.org/)
[![Auth0](https://img.shields.io/badge/Auth0-Integrated-orange?style=for-the-badge&logo=auth0)](https://auth0.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Vessel** is a cutting-edge Web3 wallet that combines the power of Account Abstraction (ERC-4337) with a seamless, gasless payment experience. Built for the future of decentralized finance.

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation)

</div>

---

## 🌟 Features

### 🔐 **Secure Authentication**
- **Google OAuth Integration** via Auth0
- **Persistent Sessions** with 7-day JWT tokens
- **Passwordless Magic Links** for frictionless login
- **HTTP-only Cookies** for maximum security

### ⚡ **Gasless Transactions**
- **ERC-4337 Account Abstraction** implementation
- **Sponsored Gas Fees** via custom Paymaster
- **One-Click Payments** with slide-to-pay interface
- **Multi-Chain Support** (Ethereum, Polygon, Arbitrum, Base)

### 💎 **Premium User Experience**
- **Glassmorphic UI** with smooth animations
- **Dark Mode** optimized design system
- **Framer Motion** powered interactions
- **GSAP Scroll Animations** for immersive experience
- **Pull-to-Refresh** mobile gestures
- **Haptic Feedback** on supported devices

### 📊 **Advanced Features**
- **Real-Time Transaction History** with filtering & search
- **Multi-Chain Asset Dashboard** with live balances
- **NFT Gallery** with metadata display
- **DeFi Positions Tracking** across protocols
- **CSV/PDF Export** for transaction records
- **AI-Powered Fraud Detection** for payment verification

### 🔒 **Security First**
- **Encrypted IndexedDB** for sensitive data
- **No Private Keys in LocalStorage**
- **XSS Protection** with Content Security Policy
- **JWT Session Management** with automatic refresh
- **Middleware Route Protection**

---

## 🎯 Demo

<div align="center">

### 🖥️ Desktop Experience
![Wallet Dashboard](https://via.placeholder.com/800x450/0A0A0A/CCFF00?text=Wallet+Dashboard)

### 📱 Mobile Experience
<img src="https://via.placeholder.com/375x812/0A0A0A/CCFF00?text=Mobile+Wallet" width="300" alt="Mobile Wallet">

</div>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **Auth0 Account** (free tier available)
- **Ethereum Wallet** (for contract deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vessel.git
cd vessel

# Install dependencies
npm install

# Setup environment variables
cd packages/frontend
cp .env.local.example .env.local
# Edit .env.local with your Auth0 credentials
```

### Configuration

#### 1. Auth0 Setup

1. Create an Auth0 account at [auth0.com](https://auth0.com)
2. Create a new **Regular Web Application**
3. Configure the following settings:

```
Allowed Callback URLs: http://localhost:3000/api/auth/callback
Allowed Logout URLs: http://localhost:3000
Allowed Web Origins: http://localhost:3000
```

4. Enable **Google Social Connection** in Auth0 Dashboard
5. Copy your credentials to `.env.local`:

```env
AUTH0_SECRET='your-secret-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
```

#### 2. Generate Auth0 Secret

```bash
openssl rand -hex 32
```

### Running the Application

```bash
# Development mode (from root)
cd packages/frontend
npm run dev

# Open http://localhost:3000
```

### Building for Production

```bash
# Build frontend
cd packages/frontend
npm run build
npm start

# Build contracts
cd packages/contracts
npx hardhat compile

# Build backend
cd packages/backend
npm run build
```

---

## 🏗️ Architecture

### Monorepo Structure

```
vessel/
├── packages/
│   ├── frontend/          # Next.js 16 + React 19
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/# React components
│   │   │   ├── lib/       # Utilities & helpers
│   │   │   ├── hooks/     # Custom React hooks
│   │   │   └── types/     # TypeScript definitions
│   │   └── public/        # Static assets
│   │
│   ├── contracts/         # Hardhat + Solidity
│   │   ├── contracts/     # Smart contracts
│   │   ├── scripts/       # Deployment scripts
│   │   └── test/          # Contract tests
│   │
│   └── backend/           # AWS Lambda functions
│       └── src/
│           └── lambda/    # Serverless functions
│
└── .kiro/                 # Kiro AI specs
    └── specs/             # Feature specifications
```

### Tech Stack

#### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 + Custom Design System
- **Animations**: Framer Motion + GSAP
- **State Management**: Zustand
- **Authentication**: Auth0 + JWT (jose)
- **Web3**: ethers.js 6
- **Storage**: IndexedDB (idb) with encryption
- **Testing**: Vitest + React Testing Library + fast-check (PBT)

#### Smart Contracts
- **Language**: Solidity ^0.8.0
- **Framework**: Hardhat 3.1.9
- **Standards**: ERC-4337 (Account Abstraction)
- **Libraries**: OpenZeppelin Contracts
- **Testing**: Hardhat Toolbox

#### Backend
- **Runtime**: AWS Lambda (Node.js)
- **Web3 Library**: viem + permissionless
- **Language**: TypeScript

---

## 🎨 Design System

### Color Palette

```css
/* Rise & Grind Theme */
--background: #0A0A0A;      /* Deep Black */
--primary: #CCFF00;         /* Neon Lime */
--secondary: #6366F1;       /* Indigo */
--accent: #06D6A0;          /* Teal */
--success: #22C55E;         /* Green */
--danger: #EF4444;          /* Red */
--muted: #71717A;           /* Gray */
```

### Typography

- **Headings**: Space Grotesk (700)
- **Body**: Inter (400, 500, 600)
- **Monospace**: JetBrains Mono

### Components

- **Glassmorphism** effects with backdrop blur
- **Gradient Borders** for premium feel
- **Smooth Transitions** (cubic-bezier easing)
- **Micro-interactions** with haptic feedback

---

## 📱 Key Features Breakdown

### 1. Wallet Dashboard

```typescript
// Real-time balance aggregation across chains
const totalBalance = useMemo(() => {
  return balances.reduce((sum, token) => 
    sum + (token.balance * token.price), 0
  );
}, [balances]);
```

**Features:**
- Multi-chain asset overview
- Live price updates
- Portfolio allocation chart
- Quick actions (Send, Receive, Scan)

### 2. Gasless Payments

```solidity
// VesselPaymaster.sol - Sponsor gas for users
function validatePaymasterUserOp(
    UserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 maxCost
) external returns (bytes memory context, uint256 validationData)
```

**Features:**
- QR code scanning
- Manual merchant code entry
- AI fraud detection
- Editable payment amounts
- Fee breakdown display

### 3. Activity Tracking

**Features:**
- Transaction history across all chains
- Advanced filtering (chain, token, status, date, amount)
- Real-time search
- Export to CSV/PDF
- Transaction details modal

### 4. Security Features

```typescript
// Encrypted storage for sensitive data
const encryptedData = await encryptData(privateKey, password);
await secureStorage.set('wallet_key', encryptedData);
```

**Features:**
- AES-256-GCM encryption
- Secure key derivation (PBKDF2)
- HTTP-only session cookies
- JWT token validation
- Middleware route protection

---

## 🔧 Development

### Project Scripts

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Watch mode

# Contracts
npx hardhat compile  # Compile contracts
npx hardhat test     # Run contract tests
npx hardhat node     # Local blockchain

# Backend
npm run build        # Compile TypeScript
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AUTH0_SECRET` | 32-byte secret for JWT signing | ✅ |
| `AUTH0_BASE_URL` | Application base URL | ✅ |
| `AUTH0_ISSUER_BASE_URL` | Auth0 tenant domain | ✅ |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | ✅ |
| `AUTH0_CLIENT_SECRET` | Auth0 application secret | ✅ |
| `AUTH0_PASSWORDLESS_CONNECTION` | Passwordless connection name | ❌ |

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- src/lib/crypto.test.ts

# Property-based testing with fast-check
npm run test -- src/lib/secure-storage.test.ts
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd packages/frontend
vercel --prod
```

**Environment Variables:**
- Add all `AUTH0_*` variables in Vercel dashboard
- Update `AUTH0_BASE_URL` to production URL

### Contracts (Lisk Sepolia)

```bash
cd packages/contracts

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network lisk-sepolia

# Verify contracts
npx hardhat verify --network lisk-sepolia DEPLOYED_ADDRESS
```

### Backend (AWS Lambda)

```bash
cd packages/backend

# Build
npm run build

# Deploy with AWS CLI or Serverless Framework
aws lambda update-function-code \
  --function-name vessel-orchestrator \
  --zip-file fileb://dist.zip
```

---

## 📚 Documentation

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | GET | Initiate Auth0 login |
| `/api/auth/callback` | GET | Handle OAuth callback |
| `/api/auth/logout` | GET | Clear session & logout |
| `/api/auth/me` | GET | Get current user session |
| `/api/user/profile` | GET | Get user profile data |

### Smart Contracts

#### VesselPaymaster
Sponsors gas fees for user operations.

```solidity
function deposit() external payable
function withdrawTo(address payable withdrawAddress, uint256 amount) external
```

#### VesselAccountFactory
Creates smart contract wallets for users.

```solidity
function createAccount(address owner, uint256 salt) external returns (address)
function getAddress(address owner, uint256 salt) external view returns (address)
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Write **tests** for new features
- Update **documentation** as needed

---

## 🐛 Known Issues

- [ ] Middleware deprecation warning (Next.js 16 - will migrate to proxy)
- [ ] GSAP scroll animations only work in browser (SSR limitation)
- [ ] IndexedDB not available in Safari private mode

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Multi-signature wallet support
- [ ] Hardware wallet integration (Ledger, Trezor)
- [ ] Fiat on-ramp integration
- [ ] Mobile app (React Native)

### Q2 2025
- [ ] Cross-chain swaps
- [ ] Staking dashboard
- [ ] Governance voting interface
- [ ] Social recovery mechanism

### Q3 2025
- [ ] DApp browser
- [ ] WalletConnect v2 integration
- [ ] Advanced analytics dashboard
- [ ] Batch transactions

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Auth0** for authentication infrastructure
- **OpenZeppelin** for secure smart contract libraries
- **Vercel** for Next.js framework and hosting
- **Lisk** for blockchain infrastructure
- **Aceternity UI** for design inspiration

---

## 📞 Support

- **Documentation**: [docs.vessel.app](https://docs.vessel.app)
- **Discord**: [Join our community](https://discord.gg/vessel)
- **Twitter**: [@VesselWallet](https://twitter.com/VesselWallet)
- **Email**: support@vessel.app

---

<div align="center">

### ⭐ Star us on GitHub!

If you find Vessel useful, please consider giving us a star. It helps us reach more developers!

**Made with ❤️ by the Vessel Team**

[Website](https://vessel.app) • [Documentation](https://docs.vessel.app) • [Blog](https://blog.vessel.app)

</div>
