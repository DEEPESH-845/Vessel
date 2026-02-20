# Implementation Plan: Crypto Wallet Dashboard

## Overview

This implementation plan breaks down the crypto wallet dashboard feature into discrete, incremental coding tasks. The dashboard will be built using React components with TypeScript, integrating with the existing Next.js application structure at `packages/frontend`. Each task builds on previous work, with property-based tests and unit tests included as sub-tasks to validate functionality early.

The implementation uses the "Rise & Grind" design system with specific colors (Dark Background #0A0A0A, Card Surface #18181B, Border Stroke #27272A, Neon Green #CCFF00). Components will be modular and reusable, following React best practices.

## Tasks

- [x] 1. Create TypeScript interfaces and data models
  - Create a new file for wallet-related TypeScript interfaces
  - Define `WalletBalance`, `Transaction`, and `DashboardData` interfaces
  - Export all interfaces for use across components
  - _Requirements: 6.1, 6.2_

- [ ] 2. Implement WalletBalanceCard component
  - [x] 2.1 Create WalletBalanceCard component file
    - Create component with props for balance value
    - Use Card Surface (#18181B) background with Border Stroke (#27272A) 1px border
    - Apply border radius between 16-24px
    - Include "Total Balance" label
    - Display balance with Space Grotesk font at 20px bold
    - Format balance with exactly 2 decimal places and "$" prefix
    - Add Neon Green (#CCFF00) accent highlights
    - Apply glassmorphism effects with subtle transparency and backdrop blur
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1, 5.2, 5.4, 5.5, 5.6, 5.8_
  
  - [x] 2.2 Write property test for balance formatting
    - **Property 1: Balance Formatting Consistency**
    - **Validates: Requirements 1.2**
    - Test that any balance value is formatted with exactly 2 decimal places and "$" prefix
    - Use fast-check to generate random balance values (0 to 10M)
    - _Requirements: 1.2_
  
  - [x] 2.3 Write unit tests for WalletBalanceCard
    - Test rendering with specific balance values
    - Test zero balance display ("$0.00")
    - Test very large balance values (>$1M)
    - Test color values are correct
    - Test border and border radius are correct
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ] 3. Implement QuickActionsGrid component
  - [x] 3.1 Create QuickActionsGrid component file
    - Create component with two buttons: "Scan QR" and "Pay"
    - Use Card Surface (#18181B) background for each button
    - Apply Border Stroke (#27272A) 1px border to each button
    - Apply border radius between 16-24px to each button
    - Use Inter font for button text
    - Add Neon Green (#CCFF00) for hover states and accents
    - Wire up Next.js Link components for /scan and /pay routes
    - Maintain 24px gaps between buttons (bento grid spacing)
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8, 2.9, 8.5_
  
  - [x] 3.2 Write property test for Scan QR navigation
    - **Property 2: Quick Action Navigation - Scan**
    - **Validates: Requirements 2.3**
    - Test that clicking "Scan QR" button navigates to /scan route
    - Test with various dashboard states
    - _Requirements: 2.3_
  
  - [x] 3.3 Write property test for Pay navigation
    - **Property 3: Quick Action Navigation - Pay**
    - **Validates: Requirements 2.4**
    - Test that clicking "Pay" button navigates to /pay route
    - Test with various dashboard states
    - _Requirements: 2.4_
  
  - [x] 3.4 Write unit tests for QuickActionsGrid
    - Test that both buttons render correctly
    - Test button navigation with Next.js Link
    - Test hover states show Neon Green accents
    - Test color values are correct
    - Test border and border radius are correct
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 4. Checkpoint - Ensure action components work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement TransactionCard component
  - [x] 5.1 Create TransactionCard component file
    - Create component with props for transaction data (id, merchant, amount, timestamp, status)
    - Use Card Surface (#18181B) background
    - Apply Border Stroke (#27272A) 1px border
    - Apply border radius between 16-24px
    - Display merchant name, amount, timestamp, and status
    - Use Inter font for transaction details
    - Use Space Grotesk font for amount display
    - Format amount with 2 decimal places
    - Show status indicator (completed, pending, failed)
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_
  
  - [x] 5.2 Write property test for transaction display completeness
    - **Property 4: Transaction Display Completeness**
    - **Validates: Requirements 3.3**
    - Test that all four required fields are displayed for any transaction
    - Use fast-check to generate random transaction objects
    - _Requirements: 3.3_
  
  - [x] 5.3 Write unit tests for TransactionCard
    - Test rendering with specific transaction data
    - Test amount formatting
    - Test status indicator display
    - Test timestamp display
    - Test color values are correct
    - Test border and border radius are correct
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 6. Implement RecentTransactionsSection component
  - [x] 6.1 Create RecentTransactionsSection component file
    - Create component with props for transactions array
    - Implement vertical list of TransactionCard components
    - Display minimum of 5 most recent transactions (if available)
    - If fewer than 5 transactions, display all available
    - If no transactions, display empty state message: "No recent transactions"
    - Use muted text color for empty state
    - Maintain card structure for visual consistency
    - _Requirements: 3.1, 3.2, 3.9_
  
  - [x] 6.2 Write property test for transaction list minimum display
    - **Property 5: Transaction List Minimum Display**
    - **Validates: Requirements 3.2**
    - Test with arrays of varying lengths (0, 1, 3, 5, 10, 100 items)
    - Verify correct number of transactions displayed
    - _Requirements: 3.2_
  
  - [x] 6.3 Write unit tests for RecentTransactionsSection
    - Test rendering with specific transaction arrays
    - Test empty state display
    - Test single transaction display
    - Test exactly 5 transactions display
    - Test more than 5 transactions (should show at least 5)
    - _Requirements: 3.1, 3.2, 3.9_

- [x] 7. Checkpoint - Ensure transaction components work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Integrate components into wallet dashboard page
  - [x] 8.1 Create or update wallet page with new components
    - Create/modify wallet page component in Next.js project
    - Import and use WalletBalanceCard, QuickActionsGrid, and RecentTransactionsSection
    - Apply Dark Background (#0A0A0A) to page background
    - Apply 24px gaps between card sections (bento grid layout)
    - Apply 24px padding to content wrapper
    - Ensure proper component ordering (Balance → Quick Actions → Transactions)
    - Pass balance and transactions data as props
    - _Requirements: 4.1, 4.2, 4.5, 5.1, 7.1, 7.2, 7.3, 7.5, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 8.2 Write property test for card background color consistency
    - **Property 6: Card Background Color Consistency**
    - **Validates: Requirements 1.3, 2.6, 3.4, 5.2**
    - Test that all card elements use Card Surface (#18181B) background
    - Query all card elements in the rendered dashboard
    - _Requirements: 1.3, 2.6, 3.4, 5.2_
  
  - [x] 8.3 Write property test for card border consistency
    - **Property 7: Card Border Consistency**
    - **Validates: Requirements 1.4, 2.7, 3.5, 5.5**
    - Test that all card elements have 1px border with Border Stroke (#27272A)
    - Query all card elements in the rendered dashboard
    - _Requirements: 1.4, 2.7, 3.5, 5.5_
  
  - [x] 8.4 Write property test for card border radius consistency
    - **Property 8: Card Border Radius Consistency**
    - **Validates: Requirements 1.6, 2.8, 3.6, 5.8**
    - Test that all card elements have border radius between 16px and 24px
    - Query all card elements in the rendered dashboard
    - _Requirements: 1.6, 2.8, 3.6, 5.8_
  
  - [x] 8.5 Write property test for dashboard spacing consistency
    - **Property 9: Dashboard Spacing Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Test spacing at various viewport widths (320px, 375px, 414px, 768px, 1024px)
    - Verify 24px gaps and padding are maintained
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 8.6 Write property test for page background color
    - **Property 10: Page Background Color**
    - **Validates: Requirements 5.1**
    - Test that page background uses Dark Background (#0A0A0A)
    - _Requirements: 5.1_
  
  - [x] 8.7 Write property test for accent color consistency
    - **Property 11: Accent Color for Interactive Elements**
    - **Validates: Requirements 1.7, 2.5, 5.3**
    - Test that interactive elements use Neon Green (#CCFF00) for accents
    - Test hover states on buttons
    - _Requirements: 1.7, 2.5, 5.3_
  
  - [x] 8.8 Write property test for typography - balance and headers
    - **Property 12: Typography - Balance and Headers**
    - **Validates: Requirements 1.5, 5.6**
    - Test that balance displays use Space Grotesk at 20px bold
    - _Requirements: 1.5, 5.6_
  
  - [x] 8.9 Write property test for typography - body text
    - **Property 13: Typography - Body Text**
    - **Validates: Requirements 2.9, 3.7, 5.7**
    - Test that body text, labels, and button text use Inter font
    - _Requirements: 2.9, 3.7, 5.7_
  
  - [x] 8.10 Write property test for typography - transaction amounts
    - **Property 14: Typography - Transaction Amounts**
    - **Validates: Requirements 3.8**
    - Test that transaction amounts use Space Grotesk font
    - _Requirements: 3.8_
  
  - [x] 8.11 Write property test for glassmorphism effects
    - **Property 15: Glassmorphism Effects**
    - **Validates: Requirements 5.4**
    - Test that card elements have glassmorphism effects (transparency and backdrop blur)
    - _Requirements: 5.4_
  
  - [x] 8.12 Write integration tests for wallet dashboard
    - Test full dashboard rendering with mock data
    - Test navigation integration with Next.js router
    - Test integration with existing bottom navigation component
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 9. Implement responsive layout and mobile optimizations
  - [x] 9.1 Add responsive breakpoints and mobile styles
    - Ensure vertical stacking on mobile devices
    - Test touch targets are minimum 44x44px
    - Test on various viewport sizes (320px, 375px, 414px, 768px, 1024px)
    - Maintain 24px spacing across all breakpoints
    - _Requirements: 4.3, 4.4, 4.6_
  
  - [x] 9.2 Write unit tests for responsive behavior
    - Test component layout at mobile breakpoint
    - Test component layout at tablet breakpoint
    - Test component layout at desktop breakpoint
    - Test spacing is maintained across breakpoints
    - _Requirements: 4.3, 4.6_

- [ ] 10. Add error handling and loading states
  - [x] 10.1 Implement error handling and fallbacks
    - Handle missing balance data (display "$0.00")
    - Handle empty transaction array (display empty state message)
    - Handle invalid transaction data (filter out invalid entries)
    - Add error boundaries for component rendering errors
    - Log errors to console for debugging
    - _Requirements: 1.2, 3.9_
  
  - [x] 10.2 Write unit tests for error handling
    - Test missing balance data handling
    - Test empty transaction array handling
    - Test invalid transaction data filtering
    - Test error boundary fallback rendering
    - _Requirements: 1.2, 3.9_

- [x] 11. Final checkpoint - Ensure all tests pass and dashboard is complete
  - Run all unit tests and property-based tests
  - Verify TypeScript compilation succeeds
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on multiple devices (mobile, tablet, desktop)
  - Verify all design system colors are correctly applied
  - Verify all spacing and typography requirements are met
  - Ensure all requirements are met
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Components are built incrementally with early validation through tests
- Checkpoints ensure incremental progress and allow for user feedback
- All components use TypeScript for type safety
- All styling uses the "Rise & Grind" design system colors
- Implementation integrates with existing Next.js project at packages/frontend
- Uses Tailwind CSS for styling with custom color values
