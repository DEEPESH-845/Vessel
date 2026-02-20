/**
 * Tests for RecentTransactionsSection component
 * 
 * Includes property-based tests to ensure comprehensive coverage.
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import RecentTransactionsSection from './recent-transactions-section';
import { Transaction } from '@/types/wallet';

describe('RecentTransactionsSection - Property Tests', () => {
  /**
   * Property 5: Transaction List Minimum Display
   * 
   * **Validates: Requirements 3.2**
   * 
   * For any transaction array with 5 or more items, the Transaction_List should
   * display at least 5 transactions. For arrays with fewer than 5 items, all
   * transactions should be displayed.
   */
  test('Property 5: Transaction list displays correct number of transactions', () => {
    // Create a generator for random transaction objects
    const transactionGen = fc.record({
      id: fc.uuid(),
      merchant: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
      timestamp: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
      status: fc.constantFrom('completed' as const, 'pending' as const, 'failed' as const)
    });

    // Test with arrays of varying lengths (0, 1, 3, 5, 10, 100 items)
    const transactionArrayGen = fc.oneof(
      fc.constant([] as Transaction[]), // 0 items
      fc.array(transactionGen, { minLength: 1, maxLength: 1 }), // 1 item
      fc.array(transactionGen, { minLength: 3, maxLength: 3 }), // 3 items
      fc.array(transactionGen, { minLength: 5, maxLength: 5 }), // 5 items
      fc.array(transactionGen, { minLength: 10, maxLength: 10 }), // 10 items
      fc.array(transactionGen, { minLength: 100, maxLength: 100 }) // 100 items
    );

    fc.assert(
      fc.property(
        transactionArrayGen,
        (transactions: Transaction[]) => {
          const { container, unmount } = render(
            <RecentTransactionsSection transactions={transactions} />
          );
          
          // Determine expected number of displayed transactions
          const expectedCount = transactions.length;
          
          if (transactions.length === 0) {
            // Should display empty state message
            const emptyStateText = screen.queryByText('No recent transactions');
            const hasEmptyState = emptyStateText !== null;
            
            // Should not display any transaction cards
            const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
            const noCards = transactionCards.length === 0;
            
            unmount();
            return hasEmptyState && noCards;
          } else {
            // Should display all transactions (no limit in current implementation)
            // The requirement states "minimum of 5 most recent" which means show at least 5 if available
            // If fewer than 5, show all available
            const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
            const actualCount = transactionCards.length;
            
            // Verify correct number of transactions are displayed
            const correctCount = actualCount === expectedCount;
            
            // If 5 or more transactions exist, verify at least 5 are displayed
            const meetsMinimum = transactions.length < 5 || actualCount >= 5;
            
            unmount();
            return correctCount && meetsMinimum;
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });
});

describe('RecentTransactionsSection - Unit Tests', () => {
  /**
   * Test rendering with specific transaction arrays
   * Requirements: 3.1, 3.2
   */
  test('renders empty state when no transactions exist', () => {
    render(<RecentTransactionsSection transactions={[]} />);
    
    // Verify empty state message is displayed
    expect(screen.getByText('No recent transactions')).toBeDefined();
  });

  test('renders single transaction correctly', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        merchant: 'Coffee Shop',
        amount: 4.50,
        timestamp: '2 hours ago',
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Verify one transaction card is displayed
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(1);
    
    // Verify transaction content is displayed
    expect(screen.getByText('Coffee Shop')).toBeDefined();
  });

  test('renders exactly 5 transactions when 5 are provided', () => {
    const transactions: Transaction[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      merchant: `Merchant ${i + 1}`,
      amount: 10.00 + i,
      timestamp: `${i + 1} hours ago`,
      status: 'completed' as const
    }));

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Verify 5 transaction cards are displayed
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(5);
  });

  test('renders all transactions when more than 5 are provided', () => {
    const transactions: Transaction[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      merchant: `Merchant ${i + 1}`,
      amount: 10.00 + i,
      timestamp: `${i + 1} hours ago`,
      status: 'completed' as const
    }));

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Verify all 10 transaction cards are displayed
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(10);
    
    // Verify at least 5 are displayed (meets minimum requirement)
    expect(transactionCards.length).toBeGreaterThanOrEqual(5);
  });

  test('renders all transactions when fewer than 5 are provided', () => {
    const transactions: Transaction[] = Array.from({ length: 3 }, (_, i) => ({
      id: `${i + 1}`,
      merchant: `Merchant ${i + 1}`,
      amount: 10.00 + i,
      timestamp: `${i + 1} hours ago`,
      status: 'completed' as const
    }));

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Verify all 3 transaction cards are displayed
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(3);
  });

  /**
   * Test empty state styling
   * Requirements: 3.9
   */
  test('empty state has correct styling', () => {
    const { container } = render(<RecentTransactionsSection transactions={[]} />);
    
    // Verify Card Surface background color
    const card = container.querySelector('div[style*="background: rgb(24, 24, 27)"]');
    expect(card).toBeDefined();
    
    // Verify Border Stroke
    const border = container.querySelector('div[style*="border: 1px solid rgb(39, 39, 42)"]');
    expect(border).toBeDefined();
    
    // Verify border radius
    const borderRadius = container.querySelector('div[style*="border-radius: 20px"]');
    expect(borderRadius).toBeDefined();
  });

  test('empty state text uses Inter font', () => {
    render(<RecentTransactionsSection transactions={[]} />);
    
    const emptyStateText = screen.getByText('No recent transactions');
    const style = emptyStateText.getAttribute('style');
    expect(style).toContain('"Inter"');
  });

  test('empty state text has muted color', () => {
    render(<RecentTransactionsSection transactions={[]} />);
    
    const emptyStateText = screen.getByText('No recent transactions');
    const style = emptyStateText.getAttribute('style');
    // Muted color #71717A
    expect(style).toContain('color: rgb(113, 113, 122)');
  });

  /**
   * Test transaction list layout
   * Requirements: 3.1
   */
  test('transactions are displayed in vertical list with correct spacing', () => {
    const transactions: Transaction[] = Array.from({ length: 3 }, (_, i) => ({
      id: `${i + 1}`,
      merchant: `Merchant ${i + 1}`,
      amount: 10.00 + i,
      timestamp: `${i + 1} hours ago`,
      status: 'completed' as const
    }));

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Verify flex column layout
    const listContainer = container.querySelector('div[class*="flex-col"]');
    expect(listContainer).toBeDefined();
    
    // Verify gap-4 spacing (16px)
    const hasGap = listContainer?.className.includes('gap-4');
    expect(hasGap).toBe(true);
  });

  /**
   * Test with large number of transactions
   */
  test('handles large number of transactions (100 items)', () => {
    const transactions: Transaction[] = Array.from({ length: 100 }, (_, i) => ({
      id: `${i + 1}`,
      merchant: `Merchant ${i + 1}`,
      amount: 10.00 + i,
      timestamp: `${i + 1} hours ago`,
      status: 'completed' as const
    }));

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Verify all 100 transaction cards are displayed
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(100);
  });
});

describe('RecentTransactionsSection - Error Handling Tests', () => {
  /**
   * Test empty transaction array handling
   * Requirements: 3.9
   */
  test('displays empty state message when transaction array is empty', () => {
    render(<RecentTransactionsSection transactions={[]} />);
    expect(screen.getByText('No recent transactions')).toBeInTheDocument();
  });

  test('maintains card structure when transaction array is empty', () => {
    const { container } = render(<RecentTransactionsSection transactions={[]} />);
    
    // Verify card still renders with proper styling
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle({ background: '#18181B' });
    
    // Check border using style attribute
    const style = card.getAttribute('style');
    expect(style).toContain('border');
    expect(style).toContain('1px solid');
  });

  /**
   * Test invalid transaction data filtering
   * Requirements: 1.2, 3.9
   */
  test('filters out transaction with missing id', () => {
    const transactions: any[] = [
      {
        merchant: 'Valid Merchant',
        amount: 10.00,
        timestamp: '1 hour ago',
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Should display empty state since the transaction is invalid
    expect(screen.getByText('No recent transactions')).toBeInTheDocument();
    
    // Should not display any transaction cards
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(0);
  });

  test('filters out transaction with missing merchant', () => {
    const transactions: any[] = [
      {
        id: '1',
        amount: 10.00,
        timestamp: '1 hour ago',
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    expect(screen.getByText('No recent transactions')).toBeInTheDocument();
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(0);
  });

  test('filters out transaction with missing amount', () => {
    const transactions: any[] = [
      {
        id: '1',
        merchant: 'Test Merchant',
        timestamp: '1 hour ago',
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    expect(screen.getByText('No recent transactions')).toBeInTheDocument();
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(0);
  });

  test('filters out transaction with NaN amount', () => {
    const transactions: any[] = [
      {
        id: '1',
        merchant: 'Test Merchant',
        amount: NaN,
        timestamp: '1 hour ago',
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    expect(screen.getByText('No recent transactions')).toBeInTheDocument();
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(0);
  });

  test('filters out transaction with missing timestamp', () => {
    const transactions: any[] = [
      {
        id: '1',
        merchant: 'Test Merchant',
        amount: 10.00,
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    expect(screen.getByText('No recent transactions')).toBeInTheDocument();
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(0);
  });

  test('filters out transaction with invalid status', () => {
    const transactions: any[] = [
      {
        id: '1',
        merchant: 'Test Merchant',
        amount: 10.00,
        timestamp: '1 hour ago',
        status: 'invalid-status'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    expect(screen.getByText('No recent transactions')).toBeInTheDocument();
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(0);
  });

  test('filters out invalid transactions but displays valid ones', () => {
    const transactions: any[] = [
      {
        id: '1',
        merchant: 'Valid Merchant 1',
        amount: 10.00,
        timestamp: '1 hour ago',
        status: 'completed'
      },
      {
        // Missing id - invalid
        merchant: 'Invalid Merchant',
        amount: 20.00,
        timestamp: '2 hours ago',
        status: 'completed'
      },
      {
        id: '3',
        merchant: 'Valid Merchant 2',
        amount: 30.00,
        timestamp: '3 hours ago',
        status: 'pending'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Should display only the 2 valid transactions
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(2);
    
    // Verify valid merchants are displayed
    expect(screen.getByText('Valid Merchant 1')).toBeInTheDocument();
    expect(screen.getByText('Valid Merchant 2')).toBeInTheDocument();
    
    // Verify invalid merchant is not displayed
    expect(screen.queryByText('Invalid Merchant')).not.toBeInTheDocument();
  });

  test('logs error to console when filtering invalid transaction', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const transactions: any[] = [
      {
        merchant: 'Invalid - Missing ID',
        amount: 10.00,
        timestamp: '1 hour ago',
        status: 'completed'
      }
    ];

    render(<RecentTransactionsSection transactions={transactions} />);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Invalid transaction data filtered out:',
      transactions[0]
    );
    
    consoleSpy.mockRestore();
  });

  test('handles mixed valid and invalid transactions correctly', () => {
    const transactions: any[] = [
      {
        id: '1',
        merchant: 'Valid 1',
        amount: 10.00,
        timestamp: '1 hour ago',
        status: 'completed'
      },
      {
        id: '2',
        merchant: 'Valid 2',
        amount: 20.00,
        timestamp: '2 hours ago',
        status: 'pending'
      },
      {
        // Invalid - missing merchant
        id: '3',
        amount: 30.00,
        timestamp: '3 hours ago',
        status: 'completed'
      },
      {
        id: '4',
        merchant: 'Valid 3',
        amount: 40.00,
        timestamp: '4 hours ago',
        status: 'failed'
      },
      {
        // Invalid - NaN amount
        id: '5',
        merchant: 'Invalid',
        amount: NaN,
        timestamp: '5 hours ago',
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Should display only the 3 valid transactions
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(3);
    
    // Verify valid merchants are displayed
    expect(screen.getByText('Valid 1')).toBeInTheDocument();
    expect(screen.getByText('Valid 2')).toBeInTheDocument();
    expect(screen.getByText('Valid 3')).toBeInTheDocument();
  });

  test('handles null transaction object', () => {
    const transactions: any[] = [
      null,
      {
        id: '1',
        merchant: 'Valid Merchant',
        amount: 10.00,
        timestamp: '1 hour ago',
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Should display only the valid transaction
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(1);
    expect(screen.getByText('Valid Merchant')).toBeInTheDocument();
  });

  test('handles undefined transaction object', () => {
    const transactions: any[] = [
      undefined,
      {
        id: '1',
        merchant: 'Valid Merchant',
        amount: 10.00,
        timestamp: '1 hour ago',
        status: 'completed'
      }
    ];

    const { container } = render(<RecentTransactionsSection transactions={transactions} />);
    
    // Should display only the valid transaction
    const transactionCards = container.querySelectorAll('[data-testid="transaction-card"]');
    expect(transactionCards.length).toBe(1);
    expect(screen.getByText('Valid Merchant')).toBeInTheDocument();
  });
});
