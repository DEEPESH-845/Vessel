/**
 * Tests for WalletBalanceCard component
 * 
 * Includes both property-based tests and unit tests to ensure comprehensive coverage.
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import WalletBalanceCard, { formatBalance } from './wallet-balance-card';

describe('WalletBalanceCard - Property Tests', () => {
  /**
   * Property 1: Balance Formatting Consistency
   * 
   * **Validates: Requirements 1.2**
   * 
   * For any wallet balance value, when displayed in the Wallet_Balance_Card,
   * the value should be formatted with exactly 2 decimal places and a "$" prefix.
   */
  test('Property 1: Balance values are formatted with exactly 2 decimal places and "$" prefix', () => {
    fc.assert(
      fc.property(
        // Generate random balance values from 0 to 10 million
        fc.float({ min: 0, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
        (balance) => {
          const formatted = formatBalance(balance);
          
          // Check that the formatted string starts with "$"
          expect(formatted).toMatch(/^\$/);
          
          // Check that the formatted string has exactly 2 decimal places
          const decimalMatch = formatted.match(/\.(\d+)$/);
          expect(decimalMatch).not.toBeNull();
          expect(decimalMatch![1]).toHaveLength(2);
          
          // Verify the numeric value is preserved correctly
          const numericPart = formatted.substring(1); // Remove "$" prefix
          const parsedValue = parseFloat(numericPart);
          expect(Math.abs(parsedValue - balance)).toBeLessThan(0.01); // Allow for rounding
          
          return true;
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });
});

describe('WalletBalanceCard - Unit Tests', () => {
  /**
   * Test rendering with specific balance values
   * Requirements: 1.1, 1.2
   */
  test('renders with specific balance value of $1,234.56', () => {
    render(<WalletBalanceCard balance={1234.56} />);
    
    // Check that the balance is displayed
    expect(screen.getByText('$1234.56')).toBeInTheDocument();
    
    // Check that the label is displayed
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
  });

  test('renders with balance value of $99.99', () => {
    render(<WalletBalanceCard balance={99.99} />);
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  test('renders with balance value of $0.01', () => {
    render(<WalletBalanceCard balance={0.01} />);
    expect(screen.getByText('$0.01')).toBeInTheDocument();
  });

  /**
   * Test zero balance display
   * Requirements: 1.2
   */
  test('displays zero balance as "$0.00"', () => {
    render(<WalletBalanceCard balance={0} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  /**
   * Test very large balance values (>$1M)
   * Requirements: 1.2
   */
  test('displays very large balance value correctly ($1,000,000)', () => {
    render(<WalletBalanceCard balance={1000000} />);
    expect(screen.getByText('$1000000.00')).toBeInTheDocument();
  });

  test('displays very large balance value correctly ($5,678,901.23)', () => {
    render(<WalletBalanceCard balance={5678901.23} />);
    expect(screen.getByText('$5678901.23')).toBeInTheDocument();
  });

  test('displays very large balance value correctly ($10,000,000)', () => {
    render(<WalletBalanceCard balance={10000000} />);
    expect(screen.getByText('$10000000.00')).toBeInTheDocument();
  });

  /**
   * Test color values are correct
   * Requirements: 1.3, 1.4, 1.7
   */
  test('applies correct Card Surface background color (#18181B)', () => {
    const { container } = render(<WalletBalanceCard balance={100} />);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveStyle({ background: '#18181B' });
  });

  test('applies correct Border Stroke color (#27272A)', () => {
    const { container } = render(<WalletBalanceCard balance={100} />);
    const card = container.firstChild as HTMLElement;
    
    // Check that border style is applied (jsdom converts hex to rgb)
    const style = card.getAttribute('style');
    expect(style).toContain('border');
    // #27272A converts to rgb(39, 39, 42)
    expect(style).toContain('rgb(39, 39, 42)');
  });

  test('applies Neon Green accent color (#CCFF00) to label', () => {
    render(<WalletBalanceCard balance={100} />);
    const label = screen.getByText('Total Balance');
    
    expect(label).toHaveStyle({ color: '#CCFF00' });
  });

  /**
   * Test border and border radius are correct
   * Requirements: 1.4, 1.6
   */
  test('applies 1px border width', () => {
    const { container } = render(<WalletBalanceCard balance={100} />);
    const card = container.firstChild as HTMLElement;
    
    // Check that border style is applied
    const style = card.getAttribute('style');
    expect(style).toContain('border');
    expect(style).toContain('1px solid');
  });

  test('applies border radius of 24px', () => {
    const { container } = render(<WalletBalanceCard balance={100} />);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toHaveStyle({ borderRadius: '24px' });
  });

  /**
   * Test typography
   * Requirements: 1.5
   */
  test('applies Space Grotesk font at 20px bold to balance', () => {
    render(<WalletBalanceCard balance={100} />);
    const balance = screen.getByText('$100.00');
    
    expect(balance).toHaveStyle({
      fontFamily: "'Space Grotesk', sans-serif",
      fontSize: '20px',
      fontWeight: 700,
    });
  });

  /**
   * Test glassmorphism effects
   * Requirements: 5.4
   */
  test('applies backdrop blur for glassmorphism effect', () => {
    const { container } = render(<WalletBalanceCard balance={100} />);
    const card = container.firstChild as HTMLElement;
    
    // Check that backdrop filter styles are applied (jsdom may not fully support these)
    const style = card.getAttribute('style');
    expect(style).toContain('backdrop-filter');
    expect(style).toContain('blur');
  });

  /**
   * Test component structure
   * Requirements: 1.1
   */
  test('renders with correct component structure', () => {
    const { container } = render(<WalletBalanceCard balance={100} />);
    
    // Check that the main card div exists
    expect(container.firstChild).toBeInTheDocument();
    
    // Check that label and balance are both present
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  /**
   * Test balance formatting edge cases
   */
  test('formats balance with trailing zeros', () => {
    render(<WalletBalanceCard balance={100} />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('formats balance with one decimal place correctly', () => {
    render(<WalletBalanceCard balance={50.5} />);
    expect(screen.getByText('$50.50')).toBeInTheDocument();
  });

  test('formats balance with no decimal places correctly', () => {
    render(<WalletBalanceCard balance={75} />);
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });
});

describe('WalletBalanceCard - Error Handling Tests', () => {
  /**
   * Test missing balance data handling
   * Requirements: 1.2
   */
  test('displays "$0.00" when balance is null', () => {
    render(<WalletBalanceCard balance={null} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  test('displays "$0.00" when balance is undefined', () => {
    render(<WalletBalanceCard balance={undefined} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  test('displays "$0.00" when balance is NaN', () => {
    render(<WalletBalanceCard balance={NaN} />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  /**
   * Test error logging for missing balance data
   */
  test('logs error to console when balance is null', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    formatBalance(null);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Missing or invalid balance data, displaying $0.00'
    );
    
    consoleSpy.mockRestore();
  });

  test('logs error to console when balance is undefined', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    formatBalance(undefined);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Missing or invalid balance data, displaying $0.00'
    );
    
    consoleSpy.mockRestore();
  });

  test('logs error to console when balance is NaN', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    formatBalance(NaN);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Missing or invalid balance data, displaying $0.00'
    );
    
    consoleSpy.mockRestore();
  });

  /**
   * Test component still renders with missing data
   */
  test('maintains card structure when balance is missing', () => {
    const { container } = render(<WalletBalanceCard balance={null} />);
    
    // Check that the card still renders
    expect(container.firstChild).toBeInTheDocument();
    
    // Check that label is still present
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    
    // Check that fallback balance is displayed
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });
});
