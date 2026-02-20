# Design Document: Crypto Wallet Dashboard

## Overview

The Crypto Wallet Dashboard is a React-based interface that provides users with a comprehensive view of their cryptocurrency wallet within a Next.js application. The design follows the "Rise & Grind" visual aesthetic, featuring a dark, modern interface with glassmorphism effects, neon green (#CCFF00) accents, and a bento grid layout system.

The dashboard consists of three primary sections:
1. **Wallet Balance Card** - Displays the user's total cryptocurrency balance prominently at the top
2. **Quick Actions** - Provides buttons for scanning QR codes and initiating payments
3. **Recent Transactions List** - Shows a scrollable list of recent payment history

The design uses the "Rise & Grind" design system with specific color palette:
- **Dark Background**: #0A0A0A (primary page background)
- **Card Surface**: #18181B (card backgrounds)
- **Border Stroke**: #27272A (1px borders on all cards)
- **Neon Green**: #CCFF00 (accent color for interactive elements and highlights)

The implementation integrates with the existing Next.js routing structure, uses Tailwind CSS for styling, and follows a bento grid layout with 24px gaps and consistent border radius (16-24px) across all cards.

## Architecture

### Component Hierarchy

```
WalletDashboard (Page Component)
├── WalletBalanceCard
│   └── Balance Display (USD with 2 decimal places)
├── QuickActionsGrid
│   ├── ScanButton
│   └── PayButton
└── RecentTransactionsSection
    └── TransactionList
        └── TransactionCard[]
```

### Data Flow

The dashboard follows a unidirectional data flow pattern:

1. **State Management**: Component receives wallet data as props:
   - `balance`: Total wallet balance in USD
   - `transactions`: Array of recent transaction history

2. **Navigation**: Uses Next.js `Link` components for navigation to `/scan` and `/pay` routes

3. **Styling**: Uses Tailwind CSS with the "Rise & Grind" design system colors and spacing

### Styling Strategy

The design uses Tailwind CSS with the "Rise & Grind" design system:

- **Colors**: 
  - Background: `bg-[#0A0A0A]` (Dark Background)
  - Card surfaces: `bg-[#18181B]` (Card Surface)
  - Borders: `border-[#27272A]` (Border Stroke, 1px)
  - Accents: `text-[#CCFF00]` or `bg-[#CCFF00]` (Neon Green)
  
- **Typography**:
  - Headers and numbers: Space Grotesk font, 20px bold
  - Body text and labels: Inter font
  
- **Spacing**: Follows bento grid system
  - `gap-6` (24px) between card sections
  - `p-6` (24px) padding on content wrapper
  - Consistent spacing across all breakpoints

- **Border Radius**: 
  - All cards use `rounded-2xl` (16px) or `rounded-3xl` (24px)
  - Consistent across all card elements

## Components and Interfaces

### 1. WalletBalanceCard Component

**Purpose**: Displays the user's total cryptocurrency balance prominently

**Visual Design**:
- Background: Card Surface (#18181B)
- Border: 1px solid Border Stroke (#27272A)
- Border radius: 16-24px (rounded-2xl or rounded-3xl)
- Accent highlights: Neon Green (#CCFF00)
- Full-width card at top of dashboard
- Glassmorphism effects with subtle transparency and backdrop blur

**Key Elements**:
- Label: "Total Balance" or similar header
- Large balance display showing USD value with 2 decimal places
- Typography: Space Grotesk font, 20px bold for balance amount

**Props Interface**:
```typescript
interface WalletBalanceCardProps {
  balance: number; // USD value
}
```

**Styling Requirements**:
- Must use Dark Background (#0A0A0A) for page background
- Must use Card Surface (#18181B) for card background
- Must include 1px Border Stroke (#27272A)
- Must apply border radius between 16px and 24px
- Must use Neon Green (#CCFF00) for accent highlights
- Must use Space Grotesk font at 20px bold for balance

### 2. QuickActionsGrid Component

**Purpose**: Provides quick access to primary wallet actions (Scan QR and Pay)

**Visual Design**:
- 2-button horizontal layout (can be grid or flex)
- Each button uses Card Surface (#18181B) background
- Border: 1px solid Border Stroke (#27272A)
- Border radius: 16-24px
- Accent color: Neon Green (#CCFF00) for highlights and hover states
- Typography: Inter font for button text

**Button Structure**:
- **Scan QR Button**:
  - Label: "Scan QR"
  - Action: Navigate to `/scan` route
  - Hover: Neon Green accent
  
- **Pay Button**:
  - Label: "Pay"
  - Action: Navigate to `/pay` route
  - Hover: Neon Green accent

**Props Interface**:
```typescript
interface QuickActionsGridProps {
  // No props needed if using Next.js Link components
  // Or optionally:
  onScanClick?: () => void;
  onPayClick?: () => void;
}
```

**Interaction**:
- Uses Next.js Link components for navigation
- Hover states with Neon Green (#CCFF00) accents
- Maintains consistent spacing with bento grid (24px gaps)

### 3. RecentTransactionsSection Component

**Purpose**: Shows recent payment history with transaction details

**Visual Design**:
- Section positioned below Quick Actions
- Vertical list of transaction cards
- Each card uses Card Surface (#18181B) background
- Border: 1px solid Border Stroke (#27272A) on each card
- Border radius: 16-24px per card
- Typography: Inter font for details, Space Grotesk for amounts

**TransactionCard Structure**:
- Recipient/merchant name
- Transaction amount (USD)
- Timestamp (human-readable)
- Transaction status (completed, pending, failed)
- Compact layout for list density

**Props Interface**:
```typescript
interface Transaction {
  id: string;
  merchant: string;        // Recipient name
  amount: number;          // USD amount
  timestamp: string;       // Human-readable time
  status: "completed" | "pending" | "failed";
}

interface RecentTransactionsSectionProps {
  transactions: Transaction[];
}
```

**Display Rules**:
- Show minimum of 5 most recent transactions (if available)
- If fewer than 5 transactions exist, show all available
- If no transactions exist, display empty state message
- Empty state: "No recent transactions" with muted styling

**Styling Requirements**:
- Must use Card Surface (#18181B) for each transaction card
- Must include 1px Border Stroke (#27272A) on each card
- Must apply border radius between 16px and 24px
- Must use Inter font for transaction details
- Must use Space Grotesk font for amounts

## Data Models

### WalletBalance

```typescript
interface WalletBalance {
  totalUSD: number;      // Total balance in USD
  lastUpdated?: Date;    // Optional timestamp
}
```

### Transaction

```typescript
interface Transaction {
  id: string;                                    // Unique identifier
  merchant: string;                              // Recipient/merchant name
  amount: number;                                // Transaction amount (USD)
  timestamp: string;                             // Human-readable time
  status: "completed" | "pending" | "failed";   // Transaction status
}
```

### DashboardData

```typescript
interface DashboardData {
  balance: number;              // Total USD balance
  transactions: Transaction[];  // Array of recent transactions
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Balance Formatting Consistency

*For any* wallet balance value, when displayed in the Wallet_Balance_Card, the value should be formatted with exactly 2 decimal places and a "$" prefix.

**Validates: Requirements 1.2**

### Property 2: Quick Action Navigation - Scan

*For any* dashboard state, when a user clicks the "Scan QR" button, the application should navigate to the /scan route.

**Validates: Requirements 2.3**

### Property 3: Quick Action Navigation - Pay

*For any* dashboard state, when a user clicks the "Pay" button, the application should navigate to the /pay route.

**Validates: Requirements 2.4**

### Property 4: Transaction Display Completeness

*For any* transaction in the transaction list, the displayed transaction card should include all four required fields: recipient name, amount, timestamp, and transaction status.

**Validates: Requirements 3.3**

### Property 5: Transaction List Minimum Display

*For any* transaction array with 5 or more items, the Transaction_List should display at least 5 transactions. For arrays with fewer than 5 items, all transactions should be displayed.

**Validates: Requirements 3.2**

### Property 6: Card Background Color Consistency

*For all* card elements in the dashboard (Wallet_Balance_Card, Quick_Actions buttons, Transaction cards), each card should use Card_Surface (#18181B) as the background color.

**Validates: Requirements 1.3, 2.6, 3.4, 5.2**

### Property 7: Card Border Consistency

*For all* card elements in the dashboard (Wallet_Balance_Card, Quick_Actions buttons, Transaction cards), each card should have a 1px border with color #27272A (Border_Stroke).

**Validates: Requirements 1.4, 2.7, 3.5, 5.5**

### Property 8: Card Border Radius Consistency

*For all* card elements in the dashboard, the border radius should be between 16px and 24px inclusive.

**Validates: Requirements 1.6, 2.8, 3.6, 5.8**

### Property 9: Dashboard Spacing Consistency

*For any* viewport width, the dashboard should maintain 24px gaps between card sections and 24px padding on the content wrapper.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 10: Page Background Color

*For any* dashboard render, the primary page background should use Dark_Background (#0A0A0A).

**Validates: Requirements 5.1**

### Property 11: Accent Color for Interactive Elements

*For all* interactive elements (buttons, hover states), the accent color should be Neon_Green (#CCFF00).

**Validates: Requirements 1.7, 2.5, 5.3**

### Property 12: Typography - Balance and Headers

*For all* balance displays and header text, the font should be Space Grotesk at 20px bold.

**Validates: Requirements 1.5, 5.6**

### Property 13: Typography - Body Text

*For all* body text, labels, and button text, the font should be Inter.

**Validates: Requirements 2.9, 3.7, 5.7**

### Property 14: Typography - Transaction Amounts

*For all* transaction amount displays, the font should be Space Grotesk.

**Validates: Requirements 3.8**

### Property 15: Glassmorphism Effects

*For all* card elements, glassmorphism effects with subtle transparency and backdrop blur should be applied.

**Validates: Requirements 5.4**

## Error Handling

### Invalid Data Handling

**Missing Balance Data**:
- If balance data is unavailable or undefined, display "$0.00"
- Optionally show a loading state or error indicator
- Maintain card structure for visual consistency

**Missing Transaction Data**:
- If transaction array is empty, display an empty state message: "No recent transactions"
- Use muted text color for empty state
- Maintain card structure for visual consistency

**Invalid Transaction Data**:
- If transaction data is malformed (missing required fields), filter out invalid entries
- Log errors to console for debugging
- Display only valid transactions in the list

### Navigation Errors

**Route Navigation Failures**:
- If navigation to /scan or /pay fails, handle gracefully
- Keep user on current page
- Optionally show error feedback to user

**Component Rendering Errors**:
- Use React error boundaries to catch rendering errors
- Display fallback UI if component fails to render
- Log errors for debugging

### Type Safety

**TypeScript Compilation**:
- All components must pass TypeScript type checking
- Props must match defined interfaces
- Enforce strict type checking for data models

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Component rendering with specific data
- Edge cases (empty states, missing data)
- Integration with Next.js routing
- Integration with existing design system

**Property Tests**: Verify universal properties across all inputs
- Balance formatting with random values
- Navigation behavior with various states
- Data display completeness with random transactions
- Design system consistency across components

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `Feature: crypto-wallet-dashboard, Property {number}: {property_text}`

**Example Test Structure**:
```typescript
// Feature: crypto-wallet-dashboard, Property 1: Balance Formatting Consistency
test('balance values are formatted with 2 decimal places', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0, max: 1000000 }),
      (balance) => {
        const formatted = formatBalance(balance);
        const decimalPart = formatted.split('.')[1];
        return decimalPart.length === 2;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Focus Areas

**Component Rendering**:
- Test that WalletBalanceCard renders with specific balance values
- Test that QuickActionsGrid renders both buttons correctly
- Test that TransactionList renders with specific transaction data
- Test empty state rendering when no transactions exist

**Edge Cases**:
- Zero balance display ("$0.00")
- Very large balance values (>$1M)
- Empty transaction list (empty state message)
- Single transaction in list
- Exactly 5 transactions in list
- More than 5 transactions in list

**Navigation**:
- Test that clicking "Scan QR" button navigates to /scan
- Test that clicking "Pay" button navigates to /pay
- Test Next.js Link component integration

**Visual Design**:
- Test that correct color values are applied
- Test that border styles are consistent
- Test that spacing values are correct
- Test that typography styles are applied

### Property Testing Focus Areas

**Data Formatting**:
- Property 1: Balance formatting with random float values (0 to 10M)
- Property 4: Transaction display completeness with random transaction objects

**Navigation**:
- Property 2: Scan QR navigation with various dashboard states
- Property 3: Pay navigation with various dashboard states

**Visual Consistency**:
- Property 6: Background color consistency across all card components
- Property 7: Border consistency across all card components
- Property 8: Border radius consistency across all card components
- Property 9: Spacing consistency across viewport widths
- Property 10: Page background color
- Property 11: Accent color for interactive elements
- Property 12-14: Typography consistency
- Property 15: Glassmorphism effects

**Data Display**:
- Property 5: Transaction list display with arrays of varying lengths (0, 1, 3, 5, 10, 100 items)

### Test Data Generators

For property-based tests, create generators for:

**Balance Generator**:
```typescript
const balanceGen = fc.float({ min: 0, max: 10000000, noNaN: true });
```

**Transaction Generator**:
```typescript
const transactionGen = fc.record({
  id: fc.uuid(),
  merchant: fc.string({ minLength: 1, maxLength: 50 }),
  amount: fc.float({ min: 0.01, max: 10000 }),
  timestamp: fc.string({ minLength: 1 }),
  status: fc.constantFrom('completed', 'pending', 'failed')
});
```

**Transaction Array Generator**:
```typescript
const transactionArrayGen = fc.array(transactionGen, { minLength: 0, maxLength: 20 });
```

### Testing Tools

**Unit Testing**:
- Jest or Vitest for test runner
- React Testing Library for component testing
- @testing-library/user-event for interaction testing

**Property-Based Testing**:
- fast-check for property-based testing
- Integration with Jest/Vitest

**Type Checking**:
- TypeScript compiler for type safety verification
- Run `tsc --noEmit` in CI pipeline

### Continuous Integration

**Pre-commit**:
- Run TypeScript type checking
- Run linting (ESLint)
- Run unit tests

**CI Pipeline**:
- Run all unit tests
- Run all property-based tests (100 iterations each)
- Check test coverage (target: >80%)
- Run build to ensure no compilation errors
- Verify TypeScript compilation succeeds

## Implementation Notes

### Integration with Existing Next.js Application

The dashboard should integrate with the existing Next.js application structure:

**File Location**:
- Implement in the existing Next.js project at `packages/frontend`
- Follow existing project structure and conventions

**Styling Integration**:
- Use existing Tailwind CSS configuration
- Integrate with existing `globals.css` if compatible
- Apply "Rise & Grind" design system colors as specified in requirements

**Navigation Integration**:
- Use Next.js Link components for navigation to `/scan` and `/pay` routes
- Integrate with existing bottom navigation component if present
- Ensure proper routing when users navigate to the wallet route

### Design System Implementation

The requirements specify the "Rise & Grind" design system with specific colors:
- Dark Background: #0A0A0A
- Card Surface: #18181B
- Border Stroke: #27272A
- Neon Green: #CCFF00 (accent)

**Implementation Approach**:
- Define these colors in Tailwind config or use inline values
- Apply consistently across all components
- Use Tailwind utility classes for responsive design
- Implement glassmorphism effects with backdrop-filter and transparency

### Typography

**Font Requirements**:
- Space Grotesk: For balance displays, headers, and important numbers (20px bold)
- Inter: For body text, labels, and button text

**Implementation**:
- Import fonts via Next.js font optimization or Google Fonts
- Define font families in Tailwind config
- Apply consistently across components

### Responsive Design

**Layout Behavior**:
- Desktop: Bento grid layout with 24px gaps
- Mobile: Stack components vertically with maintained spacing
- Use Tailwind responsive utilities (sm:, md:, lg:)
- Maintain 24px padding on content wrapper across breakpoints

### Performance Considerations

**Rendering Optimization**:
- Use React.memo() for transaction list items if list is large
- Implement virtual scrolling if transaction list exceeds 50 items
- Optimize re-renders by memoizing expensive calculations

**Bundle Size**:
- Use tree-shakeable icon libraries
- Avoid unnecessary dependencies
- Leverage Next.js code splitting

### Accessibility

**Keyboard Navigation**:
- All interactive elements must be keyboard accessible
- Use proper tab order
- Implement focus visible states

**Screen Readers**:
- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure transaction status is announced properly

**Color Contrast**:
- Verify text meets WCAG AA standards (4.5:1 for normal text)
- Test Neon Green (#CCFF00) on dark backgrounds for sufficient contrast
- Don't rely solely on color to convey transaction status

### Mobile Considerations

**Touch Targets**:
- Minimum 44x44px touch targets for buttons
- Add adequate padding around interactive elements

**Viewport Handling**:
- Account for safe areas on notched devices
- Consider bottom navigation height in layout
- Test on various device sizes and orientations
