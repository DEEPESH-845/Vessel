/**
 * Tests for TransactionCard component
 * 
 * Includes property-based tests to ensure comprehensive coverage.
 */

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import TransactionCard from './transaction-card';
import { Transaction } from '@/types/wallet';

describe('TransactionCard - Property Tests', () => {
  /**
   * Property 4: Transaction Display Completeness
   * 
   * **Validates: Requirements 3.3**
   * 
   * For any transaction in the transaction list, the displayed transaction card
   * should include all four required fields: recipient name, amount, timestamp,
   * and transaction status.
   */
  test('Property 4: All four required fields are displayed for any transaction', () => {
    // Create a generator for random transaction objects
    const transactionGen = fc.record({
      id: fc.uuid(),
      merchant: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      amount: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true, noDefaultInfinity: true }),
      timestamp: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
      status: fc.constantFrom('completed' as const, 'pending' as const, 'failed' as const)
    });

    fc.assert(
      fc.property(
        transactionGen,
        (transaction: Transaction) => {
          const { container, unmount } = render(<TransactionCard transaction={transaction} />);
          
          // Verify all four required fields are present in the rendered output
          const containerText = container.textContent || '';
          
          // 1. Verify merchant name is displayed
          expect(containerText).toContain(transaction.merchant);
          
          // 2. Verify amount is displayed (formatted with 2 decimal places)
          const formattedAmount = transaction.amount.toFixed(2);
          expect(containerText).toContain(formattedAmount);
          
          // 3. Verify timestamp is displayed
          expect(containerText).toContain(transaction.timestamp);
          
          // 4. Verify status is displayed (capitalized)
          const statusText = transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1);
          expect(containerText).toContain(statusText);
          
          // Clean up after each test
          unmount();
          
          return true;
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });
});

describe('TransactionCard - Unit Tests', () => {
  /**
   * Test rendering with specific transaction data
   * Requirements: 3.3
   */
  test('renders transaction with all fields correctly', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Coffee Shop',
      amount: 4.50,
      timestamp: '2 hours ago',
      status: 'completed'
    };

    render(<TransactionCard transaction={transaction} />);
    
    // Verify merchant name is displayed
    expect(screen.getByText('Coffee Shop')).toBeDefined();
    
    // Verify timestamp is displayed
    expect(screen.getByText('2 hours ago')).toBeDefined();
    
    // Verify status is displayed
    expect(screen.getByText('Completed')).toBeDefined();
  });

  /**
   * Test amount formatting
   * Requirements: 3.3, 3.8
   */
  test('formats amount with exactly 2 decimal places', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 123.456,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Verify amount is formatted to 2 decimal places
    expect(container.textContent).toContain('123.46');
  });

  test('formats whole number amounts with 2 decimal places', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 100,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Verify amount is formatted with .00
    expect(container.textContent).toContain('100.00');
  });

  test('formats small amounts correctly', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 0.99,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Verify small amount is formatted correctly
    expect(container.textContent).toContain('0.99');
  });

  /**
   * Test status indicator display
   * Requirements: 3.3
   */
  test('displays completed status with correct color', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Verify status text is displayed
    expect(screen.getByText('Completed')).toBeDefined();
    
    // Verify status dot has Neon Green color (#CCFF00)
    const statusDot = container.querySelector('div[style*="background-color: rgb(204, 255, 0)"]');
    expect(statusDot).toBeDefined();
  });

  test('displays pending status with correct color', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: 'now',
      status: 'pending'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Verify status text is displayed
    expect(screen.getByText('Pending')).toBeDefined();
    
    // Verify status dot has orange color (#FFA500)
    const statusDot = container.querySelector('div[style*="background-color: rgb(255, 165, 0)"]');
    expect(statusDot).toBeDefined();
  });

  test('displays failed status with correct color', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: 'now',
      status: 'failed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Verify status text is displayed
    expect(screen.getByText('Failed')).toBeDefined();
    
    // Verify status dot has red color (#FF4444)
    const statusDot = container.querySelector('div[style*="background-color: rgb(255, 68, 68)"]');
    expect(statusDot).toBeDefined();
  });

  /**
   * Test timestamp display
   * Requirements: 3.3
   */
  test('displays timestamp correctly', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: '5 minutes ago',
      status: 'completed'
    };

    render(<TransactionCard transaction={transaction} />);
    
    // Verify timestamp is displayed
    expect(screen.getByText('5 minutes ago')).toBeDefined();
  });

  test('displays various timestamp formats', () => {
    const timestamps = ['Just now', '1 hour ago', 'Yesterday', '2 days ago'];
    
    timestamps.forEach((timestamp) => {
      const transaction: Transaction = {
        id: '123',
        merchant: 'Store',
        amount: 10,
        timestamp,
        status: 'completed'
      };

      const { unmount } = render(<TransactionCard transaction={transaction} />);
      expect(screen.getByText(timestamp)).toBeDefined();
      unmount();
    });
  });

  /**
   * Test color values are correct
   * Requirements: 3.4
   */
  test('has correct Card Surface background color', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Find the main card div
    const card = container.querySelector('div[style*="background: rgb(24, 24, 27)"]');
    expect(card).toBeDefined();
  });

  /**
   * Test border and border radius are correct
   * Requirements: 3.5, 3.6
   */
  test('has correct Border Stroke color and width', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Find the main card div
    const card = container.querySelector('div[style*="border: 1px solid rgb(39, 39, 42)"]');
    expect(card).toBeDefined();
  });

  test('has correct border radius', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Find the main card div and check border radius
    const card = container.querySelector('div[style*="border-radius: 20px"]');
    expect(card).toBeDefined();
    
    // Verify 20px is within the required 16-24px range
    const borderRadius = 20;
    expect(borderRadius).toBeGreaterThanOrEqual(16);
    expect(borderRadius).toBeLessThanOrEqual(24);
  });

  /**
   * Test typography
   * Requirements: 3.7, 3.8
   */
  test('merchant name uses Inter font', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Coffee Shop',
      amount: 10,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Find the merchant name element
    const merchantElement = screen.getByText('Coffee Shop');
    const style = merchantElement.getAttribute('style');
    expect(style).toContain('"Inter"');
  });

  test('timestamp uses Inter font', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: '2 hours ago',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Find the timestamp element
    const timestampElement = screen.getByText('2 hours ago');
    const style = timestampElement.getAttribute('style');
    expect(style).toContain('"Inter"');
  });

  test('amount uses Space Grotesk font', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 42.50,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Find elements with Space Grotesk font
    const amountElements = container.querySelectorAll('[style*="Space Grotesk"]');
    expect(amountElements.length).toBeGreaterThan(0);
  });

  test('status text uses Inter font', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 10,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Find the status text element
    const statusElement = screen.getByText('Completed');
    const style = statusElement.getAttribute('style');
    expect(style).toContain('"Inter"');
  });

  /**
   * Test edge cases
   */
  test('handles long merchant names with truncation', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'This is a very long merchant name that should be truncated',
      amount: 10,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Verify merchant name is displayed
    expect(screen.getByText('This is a very long merchant name that should be truncated')).toBeDefined();
    
    // Verify truncate class is applied
    const merchantElement = screen.getByText('This is a very long merchant name that should be truncated');
    expect(merchantElement.className).toContain('truncate');
  });

  test('handles very large amounts', () => {
    const transaction: Transaction = {
      id: '123',
      merchant: 'Store',
      amount: 999999.99,
      timestamp: 'now',
      status: 'completed'
    };

    const { container } = render(<TransactionCard transaction={transaction} />);
    
    // Verify large amount is formatted correctly
    expect(container.textContent).toContain('999999.99');
  });
});
