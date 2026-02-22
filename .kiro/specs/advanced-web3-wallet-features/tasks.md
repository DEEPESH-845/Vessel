# Implementation Plan: Advanced Web3 Wallet Features

## Overview

This implementation plan breaks down 17 advanced Web3 wallet features into actionable coding tasks following a 13-week roadmap. Tasks are organized by phase and priority (P0-P3), with each task building incrementally on previous work. The plan follows the design-first workflow with TypeScript as the implementation language.

**Tech Stack**: Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4, Framer Motion, GSAP, Zustand, Vitest, fast-check

**Timeline**: 13 weeks across 5 phases
**Priority Levels**: P0 (Must-have MVP), P1 (Important for launch), P2 (Nice-to-have), P3 (Post-launch)

## Phase 1: Foundation (Weeks 1-2)

### 1. Set up authentication infrastructure and wallet creation service

- [x] 1.1 Configure authentication providers and create social login components
  - Install and configure Auth0 SDK for Next.js
  - Create `SocialLoginButtons` component with Google, Apple, and Email options
  - Implement OAuth callback handler at `/auth/callback`
  - Set up session management with JWT tokens
  - Create `AuthService` for authentication operations
  - _Requirements: FR-2.1, FR-2.2_

- [x] 1.2 Write property test for authentication token validation
  - **Property 1: Session tokens must expire after configured duration**
  - **Validates: Requirements FR-2.1, NFR-2.3**

- [x] 1.3 Implement wallet creation service with MPC and smart contract support
  - Create `WalletCreationService` with deterministic address generation
  - Implement MPC key share distribution logic
  - Implement smart contract wallet deployment preparation
  - Create `WalletCreationFlow` component with type selection
  - Add wallet creation progress indicator
  - _Requirements: FR-2.2, FR-2.3, FR-2.4_

- [x] 1.4 Write unit tests for wallet creation service
  - Test deterministic address generation
  - Test MPC key share distribution
  - Test smart contract wallet preparation
  - _Requirements: FR-2.2_


### 2. Create base data models, TypeScript interfaces, and state management

- [x] 2.1 Define core TypeScript types and interfaces
  - Create `auth.types.ts` with UserProfile, AuthResult, SocialAuthProvider interfaces
  - Create `wallet.types.ts` with CreatedWallet, RecoveryConfig, SessionKey interfaces
  - Create `transaction.types.ts` with EnhancedTransaction, TransactionMetadata interfaces
  - Create `multi-chain.types.ts` with UnifiedAsset, ChainRoute, BridgeStep interfaces
  - Create `payment-link.types.ts` with PaymentLink, Payment interfaces
  - Create `ai.types.ts` with TransactionIntent, ActionSuggestion interfaces
  - _Requirements: All FRs (foundational)_

- [x] 2.2 Set up Zustand store with slice-based architecture
  - Create store configuration in `store/index.ts`
  - Implement `auth.slice.ts` with login/logout/session management
  - Implement `wallet.slice.ts` with wallet state and session keys
  - Implement `transactions.slice.ts` with transaction tracking
  - Implement `contacts.slice.ts` with contact management
  - Implement `payment-links.slice.ts` with payment link state
  - Implement `multi-chain.slice.ts` with balance aggregation state
  - Implement `ai.slice.ts` with AI assistant state
  - Implement `ui.slice.ts` with modal and toast state
  - Configure persistence for auth, contacts, and preferences
  - _Requirements: All FRs (foundational)_

- [x] 2.3 Write unit tests for Zustand slices
  - Test auth slice actions and state updates
  - Test wallet slice session key management
  - Test multi-chain slice balance aggregation
  - _Requirements: All FRs_

### 3. Implement secure storage with IndexedDB

- [x] 3.1 Create encrypted storage utilities
  - Implement Web Crypto API wrapper for key generation
  - Create encryption/decryption functions using AES-256-GCM
  - Implement PBKDF2 key derivation from user password
  - Create IndexedDB wrapper with `idb` library
  - Implement secure session key storage
  - _Requirements: NFR-2.1, NFR-2.4_


- [x] 3.2 Write property test for encryption/decryption
  - **Property 2: Encrypted data must decrypt to original value**
  - **Validates: Requirements NFR-2.4**

- [x] 3.3 Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Core Features (Weeks 3-5)

### 4. Build Activity Page with filtering and pagination

- [x] 4.1 Create activity page route and transaction list component
  - Create `/app/activity/page.tsx` route
  - Implement `ActivityList` component with infinite scroll
  - Create `ActivityTransactionCard` component with expand/collapse
  - Implement transaction type icons and chain badges
  - Add loading states and skeleton loaders
  - _Requirements: FR-1.1, FR-1.4_

- [x] 4.2 Implement transaction filtering system
  - Create `ActivityFilterPanel` component
  - Implement chain filter (multi-select)
  - Implement token filter (multi-select)
  - Implement status filter (pending, completed, failed)
  - Implement date range filter
  - Implement amount range filter
  - Add "Clear all filters" functionality
  - Persist filters in URL query parameters
  - _Requirements: FR-1.2_

- [x] 4.3 Add transaction search functionality
  - Implement search by transaction hash
  - Implement search by recipient address
  - Implement search by ENS name
  - Add search result highlighting
  - Optimize search performance with debouncing
  - _Requirements: FR-1.3_

- [x] 4.4 Implement transaction export feature
  - Create `ActivityExportDialog` component
  - Implement CSV export with all transaction details
  - Implement JSON export
  - Implement PDF export with formatting
  - Add date range selection for export
  - Handle large exports with streaming
  - _Requirements: FR-1.5_


- [x] 4.5 Write integration tests for activity page
  - Test filtering combinations
  - Test search functionality
  - Test export generation
  - _Requirements: FR-1.2, FR-1.3, FR-1.5_

### 5. Implement session key management

- [x] 5.1 Create session key service and smart contract integration
  - Implement `SessionKeyService` with key generation
  - Create session key permission validation logic
  - Implement session key registration with smart contract wallet
  - Add session key expiration checking
  - Create session key storage in IndexedDB
  - _Requirements: FR-6.1, FR-6.4_

- [x] 5.2 Build session key management UI
  - Create `SessionKeyManagement` component
  - Display active session keys with details
  - Show remaining spending limit and expiration
  - Implement manual revocation functionality
  - Add session key creation dialog with permission configuration
  - _Requirements: FR-6.3_

- [x] 5.3 Implement transaction signing with session keys
  - Add session key validation before signing
  - Check spending limits and time limits
  - Verify contract/function permissions
  - Track session key usage and spending
  - Implement automatic revocation on expiry
  - _Requirements: FR-6.2_

- [ ] 5.4 Write property test for session key permissions
  - **Property 3: Session keys must not exceed spending limits**
  - **Validates: Requirements FR-6.2, FR-6.4**

- [ ] 5.5 Write property test for session key expiration
  - **Property 4: Expired session keys must be rejected**
  - **Validates: Requirements FR-6.2, FR-6.4**

### 6. Integrate ENS resolution and caching

- [x] 6.1 Create ENS resolver service
  - Implement `ENSResolverService` with forward resolution
  - Implement reverse ENS lookup
  - Add support for alternative name services (Unstoppable Domains, Lens)
  - Implement LRU cache for resolved names
  - Configure cache TTL (5 min forward, 1 hour reverse)
  - _Requirements: FR-7.1, FR-7.2, FR-7.4_


- [x] 6.2 Create ENS display components
  - Create `ENSAvatar` component with fallback to identicon
  - Create `ENSNameDisplay` component with address fallback
  - Implement ENS profile display with text records
  - Add loading states during resolution
  - _Requirements: FR-7.3_

- [x] 6.3 Integrate ENS throughout the application
  - Replace address displays with ENS names where available
  - Add ENS resolution to contact forms
  - Integrate ENS in transaction flows
  - Add ENS to activity page transaction cards
  - _Requirements: FR-7.1, FR-7.2_

- [ ] 6.4 Write property test for ENS resolution consistency
  - **Property 5: Forward and reverse ENS resolution must be consistent**
  - **Validates: Requirements FR-7.1, FR-7.2**

### 7. Create contact list functionality

- [x] 7.1 Implement contact service and API integration
  - Create `ContactService` with CRUD operations
  - Implement backend API client for contacts
  - Add contact validation (address format, uniqueness)
  - Implement contact sync across devices
  - Add automatic ENS resolution for contacts
  - _Requirements: FR-8.1, FR-8.4_

- [x] 7.2 Build contact management UI
  - Create `ContactList` component with search and filtering
  - Create `ContactCard` component with avatar and details
  - Implement `ContactFormDialog` for add/edit
  - Add tag management for contacts
  - Implement contact deletion with confirmation
  - _Requirements: FR-8.1, FR-8.2_

- [x] 7.3 Add contact usage tracking
  - Track "last used" timestamp on transactions
  - Track transaction count per contact
  - Track total volume sent to contact
  - Display frequently used contacts first
  - Show recent contacts in send flow
  - _Requirements: FR-8.3_

- [x] 7.4 Create contact selector component
  - Implement `ContactSelector` with autocomplete
  - Show contact suggestions based on usage
  - Display contact avatars and ENS names
  - Add "Add as contact" suggestion in transaction flows
  - _Requirements: FR-8.4_


- [ ] 7.5 Write unit tests for contact service
  - Test CRUD operations
  - Test contact validation
  - Test usage tracking
  - _Requirements: FR-8.1, FR-8.3_

### 8. Build unified asset dashboard with multi-chain aggregation

- [x] 8.1 Create multi-chain balance aggregation service
  - Implement `ChainAggregatorService` with parallel RPC calls
  - Create RPC provider configuration for Ethereum, Polygon, Arbitrum, Base
  - Implement native token balance fetching
  - Implement ERC-20 token balance fetching
  - Implement NFT ownership querying
  - Implement DeFi position detection (Aave, Compound, Uniswap)
  - Add request batching and caching
  - _Requirements: FR-11.1, NFR-1.4_

- [x] 8.2 Write property test for balance aggregation
  - **Property 6: Total value must equal sum of all asset values**
  - **Validates: Requirements FR-11.2**

- [x] 8.3 Create unified asset dashboard component
  - Create `UnifiedAssetDashboard` component
  - Implement `MultiChainBalanceCard` with total value display
  - Add animated counter for total portfolio value
  - Create chain breakdown visualization
  - Add refresh button with loading state
  - Implement auto-refresh every 30 seconds
  - _Requirements: FR-11.2_

- [x] 8.4 Build token list display
  - Create `TokenList` component with sorting
  - Create `TokenCard` with icon, balance, USD value
  - Add 24-hour price change indicator
  - Implement sparkline price chart
  - Add quick actions (send, swap) to token cards
  - _Requirements: FR-11.4_

- [x] 8.5 Build NFT grid display
  - Create `NFTGrid` component with responsive layout
  - Create `NFTCard` with lazy-loaded images
  - Display NFT name, collection, and floor price
  - Implement image zoom on click
  - Add link to NFT marketplace
  - _Requirements: FR-11.5_

- [x] 8.6 Build DeFi positions display
  - Create `DeFiPositionsList` component
  - Create `DeFiPositionCard` with protocol info
  - Display deposited amount, current value, and APY
  - Show earned rewards with claim button
  - Add link to protocol dashboard
  - _Requirements: FR-11.6_


- [x] 8.7 Implement pending transactions banner
  - Create `PendingTransactionsBanner` component
  - Display pending transaction count and details
  - Show estimated confirmation time
  - Add cancel button for cancellable transactions
  - Update status in real-time via WebSocket
  - _Requirements: FR-11.7_

- [x] 8.8 Write integration tests for unified dashboard
  - Test multi-chain balance aggregation
  - Test asset categorization
  - Test pending transaction display
  - _Requirements: FR-11.1, FR-11.7_

- [x] 8.9 Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Advanced Transactions (Weeks 6-8)

### 9. Implement meta-transactions with relayer integration

- [x] 9.1 Create meta-transaction service
  - Implement `MetaTransactionService` with EIP-712 signing
  - Create relayer client for transaction submission
  - Implement relayer selection based on gas price
  - Add automatic retry with exponential backoff
  - Implement fallback to alternative relayers
  - _Requirements: FR-4.1, FR-4.2_

- [x] 9.2 Add meta-transaction status tracking
  - Implement WebSocket connection for real-time updates
  - Track relayer submission status
  - Track on-chain confirmation status
  - Display status in transaction timeline
  - Send notifications on confirmation
  - _Requirements: FR-4.3_

- [ ] 9.3 Write unit tests for meta-transaction service
  - Test EIP-712 signature generation
  - Test relayer submission
  - Test failure handling and retries
  - _Requirements: FR-4.1, FR-4.2_

### 10. Build paymaster integration for gas abstraction

- [x] 10.1 Create paymaster service
  - Implement `PaymasterService` with ERC-4337 integration
  - Create gas estimation in stablecoin
  - Implement token approval for paymaster
  - Add UserOperation construction
  - Implement paymaster transaction execution
  - _Requirements: FR-5.1, FR-5.3_


- [x] 10.2 Build gas payment UI
  - Add gas payment method selector (native vs stablecoin)
  - Display gas cost in both native token and stablecoin
  - Show exchange rate and slippage
  - Add cost breakdown (gas + paymaster fee)
  - Update estimates every 15 seconds
  - _Requirements: FR-5.2_

- [ ] 10.3 Write property test for gas payment conservation
  - **Property 7: Stablecoin gas payment must respect exchange rate and slippage**
  - **Validates: Requirements FR-5.1, FR-5.2**

- [ ] 10.4 Write unit tests for paymaster service
  - Test gas estimation accuracy
  - Test token approval flow
  - Test UserOperation construction
  - _Requirements: FR-5.1, FR-5.3_

### 11. Create payment link system

- [x] 11.1 Implement payment link service and backend API
  - Create `PaymentLinkService` with CRUD operations
  - Implement backend API endpoints for payment links
  - Add payment link validation (expiry, max uses)
  - Implement payment processing logic
  - Add auto-conversion to preferred stablecoin
  - _Requirements: FR-12.1, FR-12.2_

- [x] 11.2 Build payment link creator UI
  - Create `PaymentLinkCreator` component
  - Add amount and currency selection
  - Implement accepted tokens multi-select
  - Add optional expiration date picker
  - Add optional max uses input
  - Implement description and branding options
  - Generate shareable URL with copy button
  - _Requirements: FR-12.1, FR-12.2_

- [x] 11.3 Create payment link payment page
  - Create `/app/pay/[linkId]/page.tsx` route
  - Display payment amount and description
  - Show accepted tokens with current rates
  - Implement token selector for payment
  - Calculate exact token amount needed
  - Execute payment transaction
  - Show payment confirmation and redirect
  - _Requirements: FR-12.3_

- [x] 11.4 Build payment link management interface
  - Create `PaymentLinksList` component
  - Display payment status (active, expired, completed)
  - Show payment count and total received
  - Implement link editing for active links
  - Add link deactivation functionality
  - Implement payment history per link
  - _Requirements: FR-12.4_


- [x] 11.5 Add payment notifications
  - Implement email notifications for payments
  - Add push notifications for payments
  - Display in-app notification badge
  - Show payment details in notifications
  - Add notification preferences
  - _Requirements: FR-12.5_

- [ ] 11.6 Write property test for payment link constraints
  - **Property 8: Payment links must not exceed max uses**
  - **Validates: Requirements FR-12.1, FR-12.3**

- [ ] 11.7 Write integration tests for payment links
  - Test payment link creation
  - Test payment processing
  - Test expiration handling
  - _Requirements: FR-12.1, FR-12.3_

### 12. Integrate fiat on-ramp and off-ramp providers

- [x] 12.1 Create fiat provider integration service
  - Implement `FiatService` with provider aggregation
  - Integrate Moonpay SDK for on-ramp
  - Integrate Transak SDK for on-ramp
  - Integrate Ramp Network SDK for on-ramp
  - Implement provider selection logic
  - Add KYC status tracking
  - _Requirements: FR-10.1, FR-10.3, FR-10.4_

- [x] 12.2 Build on-ramp UI
  - Create `OnRampWidget` component
  - Display provider comparison (fees, limits, ratings)
  - Embed provider widget in modal
  - Handle payment method selection
  - Track purchase status
  - Show completion notification
  - _Requirements: FR-10.1, FR-10.3_

- [x] 12.3 Build off-ramp UI
  - Create `OffRampForm` component
  - Collect bank account information
  - Display withdrawal fees and exchange rates
  - Show estimated withdrawal time
  - Execute crypto sale transaction
  - Track withdrawal status
  - _Requirements: FR-10.2_

- [ ] 12.4 Write unit tests for fiat service
  - Test provider selection logic
  - Test KYC status tracking
  - Test transaction status updates
  - _Requirements: FR-10.1, FR-10.4_

### 13. Implement transaction timeline animations

- [x] 13.1 Create transaction timeline component
  - Create `TransactionTimeline` component with Framer Motion
  - Define timeline stages (signing, broadcasting, confirming, completed)
  - Implement stage transition animations
  - Add progress bar for confirmations
  - Display stage timestamps
  - Show estimated time for each stage
  - _Requirements: FR-14.1_


- [x] 13.2 Add visual feedback and animations
  - Implement color-coded stage indicators
  - Add particle effects for completed stages
  - Implement haptic feedback on mobile
  - Add optional sound effects
  - Optimize animations for 60fps
  - Support reduced motion preferences
  - _Requirements: FR-14.2, NFR-1.3_

- [x] 13.3 Create cross-chain transaction timeline
  - Extend timeline for cross-chain transactions
  - Show source chain transaction stages
  - Show bridge processing stage
  - Show destination chain transaction stages
  - Animate flow between chains
  - Display total elapsed time
  - _Requirements: FR-14.3_

- [ ] 13.4 Write unit tests for timeline component
  - Test stage transitions
  - Test animation triggers
  - Test reduced motion support
  - _Requirements: FR-14.1, FR-14.2_

- [ ] 13.5 Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: Multi-Chain & AI (Weeks 9-11)

### 14. Build multi-chain routing with bridge aggregators

- [x] 14.1 Create multi-chain router service
  - Implement `MultiChainRouter` with Socket integration
  - Integrate LI.FI SDK for cross-chain routing
  - Implement route discovery across multiple bridges
  - Calculate cost, time, and security scores for routes
  - Rank routes based on user priority (cost/speed/security)
  - _Requirements: FR-9.1_

- [x] 14.2 Build route selection UI
  - Create `BridgeSelector` component
  - Display route options with cost, time, security
  - Highlight recommended route
  - Show bridge protocols used in route
  - Display intermediate steps for multi-hop routes
  - Add route comparison view
  - _Requirements: FR-9.2_

- [x] 14.3 Implement route execution
  - Execute token approval for bridge
  - Submit bridge transaction on source chain
  - Track bridge transaction status
  - Monitor destination chain for completion
  - Handle bridge failures with refund logic
  - Send notifications for each step completion
  - _Requirements: FR-9.3_


- [x] 14.4 Add route progress tracking
  - Show current step in multi-step route
  - Display estimated time remaining
  - Update progress in real-time
  - Show transaction hashes for each step
  - Provide links to bridge explorers
  - Notify user when transfer completes
  - _Requirements: FR-9.4_

- [ ] 14.5 Write property test for route validity
  - **Property 9: All routes must have valid bridge steps with non-negative fees**
  - **Validates: Requirements FR-9.1**

- [ ] 14.6 Write integration tests for multi-chain routing
  - Test route discovery
  - Test route execution
  - Test failure handling
  - _Requirements: FR-9.1, FR-9.3_

### 15. Implement cross-chain transfer map animation

- [x] 15.1 Create cross-chain map component
  - Create `CrossChainMap` component with SVG
  - Position chain nodes in logical layout
  - Display chain logos and names
  - Implement zoom and pan functionality
  - Make map responsive to screen size
  - _Requirements: FR-17.1_

- [x] 15.2 Implement transfer animation with GSAP
  - Create particle animation along transfer path
  - Implement path drawing between chains
  - Add pulse effects on source and destination chains
  - Animate intermediate chains for multi-hop
  - Optimize animation for 60fps
  - _Requirements: FR-17.2_

- [x] 15.3 Add interactive map features
  - Implement chain click to view details
  - Add hover tooltips with chain info
  - Display active transfer count per chain
  - Show total value locked per chain
  - Add chain visibility toggle
  - _Requirements: FR-17.3_

- [ ] 15.4 Write unit tests for map component
  - Test chain positioning
  - Test animation triggers
  - Test interactive features
  - _Requirements: FR-17.1, FR-17.3_

### 16. Integrate AI payment assistant

- [x] 16.1 Create AI intent parser service
  - Implement `IntentParserService` with OpenAI integration
  - Create prompt templates for transaction parsing
  - Implement entity extraction from user input
  - Add confidence score calculation
  - Identify missing parameters for clarification
  - Sanitize user input to prevent prompt injection
  - _Requirements: FR-13.1, FR-13.2_


- [x] 16.2 Build AI assistant chat interface
  - Create `AIAssistantChat` component
  - Implement chat message display with history
  - Add typing indicator for AI responses
  - Stream AI responses for perceived speed
  - Create `AIIntentDisplay` component for parsed intents
  - Add quick action buttons for common intents
  - _Requirements: FR-13.5_

- [x] 16.3 Implement transaction suggestions
  - Create `SuggestionEngine` for proactive suggestions
  - Suggest gas optimization opportunities
  - Recommend better bridge routes
  - Identify arbitrage opportunities
  - Warn about high-risk transactions
  - Provide educational tips
  - _Requirements: FR-13.3_

- [x] 16.4 Add transaction explanation feature
  - Implement transaction decoding for contract interactions
  - Generate human-readable descriptions
  - Show expected balance changes
  - Warn about potential risks
  - Provide links to learn more
  - _Requirements: FR-13.4_

- [ ] 16.5 Write property test for AI intent confidence
  - **Property 10: High confidence intents must have all required parameters**
  - **Validates: Requirements FR-13.1, FR-13.2**

- [ ] 16.6 Write unit tests for AI service
  - Test intent parsing with various inputs
  - Test prompt injection prevention
  - Test suggestion generation
  - _Requirements: FR-13.1, FR-13.3_

### 17. Create visual gas estimator slider

- [x] 17.1 Build gas estimator service
  - Create `GasEstimatorService` with gas price fetching
  - Implement EIP-1559 base fee + priority fee calculation
  - Calculate confirmation time estimates
  - Calculate cost in native token and USD
  - Support custom gas price input
  - Update gas prices every 15 seconds
  - _Requirements: FR-15.1_

- [x] 17.2 Create gas slider component
  - Create `GasEstimatorSlider` component
  - Implement interactive slider with Framer Motion
  - Add color gradient from green (slow) to red (fast)
  - Snap to predefined options (slow, standard, fast, instant)
  - Display selected option prominently
  - Show cost difference from standard
  - _Requirements: FR-15.2_


- [x] 17.3 Add gas price visualization
  - Create cost vs. speed chart
  - Display network congestion indicator
  - Show probability of confirmation
  - Highlight recommended option
  - Warn if gas price is unusually high
  - Explain gas price components
  - _Requirements: FR-15.3_

- [ ] 17.4 Write unit tests for gas estimator
  - Test gas price calculation
  - Test confirmation time estimation
  - Test cost calculation
  - _Requirements: FR-15.1_

### 18. Build address identity cards

- [x] 18.1 Create address identity service
  - Implement `AddressIdentityService` with ENS integration
  - Fetch address labels from Etherscan
  - Query reputation scores
  - Check social verifications (Twitter, GitHub)
  - Identify contract addresses
  - Implement caching for identity data
  - _Requirements: FR-16.1_

- [x] 18.2 Build identity card component
  - Create `AddressIdentityCard` component
  - Display avatar or identicon
  - Show ENS name prominently
  - Display address with copy button
  - Show reputation badges
  - Display social verification icons
  - Indicate if address is contract
  - _Requirements: FR-16.2_

- [x] 18.3 Implement reputation system
  - Calculate reputation score based on transaction count
  - Factor in account age
  - Factor in social verifications
  - Categorize as: New, Active, Trusted, Verified
  - Display reputation level badge
  - Show reputation score (0-100)
  - _Requirements: FR-16.3_

- [x] 18.4 Add risk indicators
  - Warn about new addresses (< 7 days old)
  - Flag addresses with suspicious activity
  - Highlight addresses on blacklists
  - Show warning for unverified contracts
  - Display risk level (low, medium, high)
  - _Requirements: FR-16.4_

- [ ] 18.5 Write unit tests for identity service
  - Test identity resolution
  - Test reputation calculation
  - Test risk assessment
  - _Requirements: FR-16.1, FR-16.3, FR-16.4_

- [ ] 18.6 Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


## Phase 5: Polish & Testing (Weeks 12-13)

### 19. Implement wallet recovery system

- [x] 19.1 Create MPC recovery service
  - Implement `MPCRecoveryService` with key share retrieval
  - Reconstruct private key from threshold shares (2-of-3)
  - Handle provider unavailability with fallbacks
  - Verify recovered wallet address matches original
  - Implement recovery progress tracking
  - _Requirements: FR-3.2_

- [x] 19.2 Create social recovery service
  - Implement `SocialRecoveryService` with guardian management
  - Collect guardian signatures for recovery
  - Implement 48-hour timelock before execution
  - Allow wallet owner to cancel recovery
  - Execute recovery after timelock expires
  - Update wallet ownership on-chain
  - _Requirements: FR-3.3_

- [x] 19.3 Build recovery UI
  - Create recovery initiation page at `/wallet/recovery`
  - Implement `RecoveryMethodSelector` component
  - Create `GuardianSetup` component for adding guardians
  - Build `MPCRecoveryFlow` component with progress tracking
  - Add recovery cancellation functionality
  - Show recovery status and notifications
  - _Requirements: FR-3.1, FR-3.4_

- [ ] 19.4 Write property test for social recovery threshold
  - **Property 11: Social recovery must require threshold guardian signatures**
  - **Validates: Requirements FR-3.3**

- [ ] 19.5 Write integration tests for recovery
  - Test MPC recovery flow
  - Test social recovery flow
  - Test recovery cancellation
  - _Requirements: FR-3.2, FR-3.3_

### 20. Comprehensive testing and optimization

- [ ] 20.1 Write property-based tests for critical logic
  - **Property 12: Transaction status must follow valid state machine**
  - **Validates: Requirements FR-1.1, FR-11.7**
  - Test balance conservation across transactions
  - Test multi-chain balance aggregation correctness
  - Test payment link expiration and usage limits
  - Test cross-chain route validity
  - _Requirements: All FRs_

- [ ] 20.2 Write integration tests for user flows
  - Test complete social login → wallet creation → first transaction flow
  - Test cross-chain transfer with bridge execution
  - Test payment link creation → payment → auto-conversion
  - Test AI assistant → intent parsing → transaction execution
  - Test multi-chain balance fetch → unified dashboard display
  - _Requirements: All FRs_


- [ ] 20.3 Performance optimization
  - Optimize multi-chain data fetching with request batching
  - Implement ENS resolution caching with LRU cache
  - Add virtual scrolling for large transaction lists
  - Optimize animation performance for 60fps
  - Implement lazy loading for animation libraries
  - Add code splitting for feature modules
  - Optimize bundle size with tree shaking
  - _Requirements: NFR-1.1, NFR-1.2, NFR-1.3, NFR-1.4_

- [ ] 20.4 Security hardening
  - Implement transaction safety verification
  - Add spending limits and velocity checks
  - Implement rate limiting for sensitive operations
  - Add anomaly detection for session keys
  - Implement bridge safety validation
  - Add prompt injection prevention for AI
  - Conduct security audit of key management
  - _Requirements: NFR-2.1, NFR-2.2, NFR-2.3, NFR-2.4, NFR-2.5_

- [ ] 20.5 Accessibility improvements
  - Ensure WCAG 2.1 Level AA compliance
  - Add keyboard navigation support
  - Implement screen reader support
  - Verify color contrast ratios
  - Add reduced motion support
  - Provide text alternatives for images
  - _Requirements: NFR-5.2_

- [ ] 20.6 Error handling and resilience
  - Implement user-friendly error messages
  - Add comprehensive error logging
  - Implement retry logic for transient failures
  - Add fallback options for service failures
  - Implement RPC provider failover
  - Add graceful degradation for feature failures
  - _Requirements: NFR-4.2, NFR-4.4_

### 21. Documentation and deployment preparation

- [ ] 21.1 Create component documentation
  - Document all public component props and usage
  - Add Storybook stories for key components
  - Document service APIs and methods
  - Create architecture diagrams
  - Document state management patterns
  - _Requirements: NFR-6.2_

- [ ] 21.2 Set up monitoring and analytics
  - Integrate Sentry for error tracking
  - Set up Google Analytics for user analytics
  - Implement performance monitoring
  - Add custom event tracking for key actions
  - Set up alerting for critical issues
  - Create monitoring dashboards
  - _Requirements: NFR-6.3_

- [ ] 21.3 Configure deployment pipeline
  - Set up environment variables for production
  - Configure feature flags system
  - Set up CI/CD pipeline
  - Configure security headers
  - Set up CDN for static assets
  - Implement health check endpoints
  - _Requirements: NFR-4.1_


- [ ] 21.4 Final testing and validation
  - Run full test suite and ensure 80%+ coverage
  - Perform manual testing of all features
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on mobile devices (iOS, Android)
  - Conduct load testing for scalability
  - Perform security penetration testing
  - Validate against all acceptance criteria
  - _Requirements: All FRs, NFRs_

- [ ] 21.5 Checkpoint - Final validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end feature flows
- All tasks build incrementally on previous work
- No orphaned code - everything is integrated

## Feature Priority Summary

### P0 Features (Must-have for MVP)
- FR-1: Activity Page
- FR-2: Social Login & Auto Wallet Creation
- FR-11: Unified Asset Dashboard

### P1 Features (Important for launch)
- FR-5: Gas in Stablecoin
- FR-6: Session Keys
- FR-7: ENS Mapping
- FR-8: Contact List
- FR-12: Payment Links

### P2 Features (Nice-to-have for launch)
- FR-3: Wallet Recovery
- FR-4: Meta-Transactions
- FR-9: Multi-Chain Auto Routing
- FR-10: Fiat On/Off Ramp

### P3 Features (Post-launch enhancements)
- FR-13: AI Payment Assistant
- FR-14: Transaction Timeline Animation
- FR-15: Visual Gas Estimator Slider
- FR-16: Address Identity Cards
- FR-17: Cross-Chain Transfer Map Animation

## Implementation Dependencies

```
Phase 1 (Foundation)
  ↓
Phase 2 (Core Features)
  ├─ Activity Page (depends on: auth, wallet)
  ├─ Session Keys (depends on: wallet, storage)
  ├─ ENS Integration (depends on: RPC providers)
  ├─ Contact List (depends on: storage, ENS)
  └─ Unified Dashboard (depends on: multi-chain service)
  ↓
Phase 3 (Advanced Transactions)
  ├─ Meta-Transactions (depends on: wallet, relayer)
  ├─ Gas Abstraction (depends on: paymaster contracts)
  ├─ Payment Links (depends on: backend API)
  ├─ Fiat Integration (depends on: provider SDKs)
  └─ Transaction Timeline (depends on: animations)
  ↓
Phase 4 (Multi-Chain & AI)
  ├─ Multi-Chain Routing (depends on: bridge aggregators)
  ├─ Cross-Chain Map (depends on: routing, animations)
  ├─ AI Assistant (depends on: LLM API)
  ├─ Gas Estimator (depends on: gas oracle)
  └─ Address Identity (depends on: ENS, reputation APIs)
  ↓
Phase 5 (Polish & Testing)
  ├─ Wallet Recovery (depends on: MPC/guardians)
  ├─ Comprehensive Testing (depends on: all features)
  ├─ Performance Optimization (depends on: all features)
  └─ Deployment (depends on: all features)
```

## Success Criteria

- All P0 features fully implemented and tested
- 80%+ test coverage across all features
- All acceptance criteria met for implemented features
- Performance targets achieved (< 2s page load, < 500ms API response)
- Security audit passed with no critical issues
- Accessibility compliance verified
- Documentation complete for all features
- Deployment pipeline configured and tested

