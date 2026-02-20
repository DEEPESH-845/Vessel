/**
 * Tests for QuickActionsGrid component
 * 
 * Includes property-based tests for navigation behavior and unit tests for rendering.
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import QuickActionsGrid from './quick-actions-grid';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

describe('QuickActionsGrid - Property Tests', () => {
  /**
   * Property 2: Quick Action Navigation - Scan
   * 
   * **Validates: Requirements 2.3**
   * 
   * For any dashboard state, when a user clicks the "Scan QR" button,
   * the application should navigate to the /scan route.
   */
  test('Property 2: Clicking "Scan QR" button navigates to /scan route', () => {
    fc.assert(
      fc.property(
        // Generate various dashboard states (balance and transaction count)
        fc.record({
          balance: fc.float({ min: 0, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          transactionCount: fc.integer({ min: 0, max: 100 }),
        }),
        (_dashboardState) => {
          // Render the component (it doesn't take props, so state doesn't affect rendering)
          const { unmount } = render(<QuickActionsGrid />);
          
          // Find the Scan QR button by its text
          const scanButton = screen.getByText('Scan QR').closest('a');
          
          // Verify the button exists
          if (!scanButton) {
            unmount();
            return false;
          }
          
          // Verify the button has the correct href attribute pointing to /scan
          const hasCorrectHref = scanButton.getAttribute('href') === '/scan';
          
          // Clean up
          unmount();
          
          return hasCorrectHref;
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  /**
   * Property 3: Quick Action Navigation - Pay
   * 
   * **Validates: Requirements 2.4**
   * 
   * For any dashboard state, when a user clicks the "Pay" button,
   * the application should navigate to the /pay route.
   */
  test('Property 3: Clicking "Pay" button navigates to /pay route', () => {
    fc.assert(
      fc.property(
        // Generate various dashboard states (balance and transaction count)
        fc.record({
          balance: fc.float({ min: 0, max: 10_000_000, noNaN: true, noDefaultInfinity: true }),
          transactionCount: fc.integer({ min: 0, max: 100 }),
        }),
        (_dashboardState) => {
          // Render the component (it doesn't take props, so state doesn't affect rendering)
          const { unmount } = render(<QuickActionsGrid />);
          
          // Find the Pay button by its text
          const payButton = screen.getByText('Pay').closest('a');
          
          // Verify the button exists
          if (!payButton) {
            unmount();
            return false;
          }
          
          // Verify the button has the correct href attribute pointing to /pay
          const hasCorrectHref = payButton.getAttribute('href') === '/pay';
          
          // Clean up
          unmount();
          
          return hasCorrectHref;
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });
});

describe('QuickActionsGrid - Unit Tests', () => {
  /**
   * Test that both buttons render correctly
   * Requirements: 2.1, 2.2
   */
  test('renders both "Scan QR" and "Pay" buttons', () => {
    render(<QuickActionsGrid />);
    
    // Verify both buttons are present
    const scanButton = screen.getByText('Scan QR');
    const payButton = screen.getByText('Pay');
    
    expect(scanButton).toBeDefined();
    expect(payButton).toBeDefined();
  });

  /**
   * Test button navigation with Next.js Link
   * Requirements: 2.3, 2.4, 8.5
   */
  test('Scan QR button has correct href for navigation', () => {
    render(<QuickActionsGrid />);
    
    const scanButton = screen.getByText('Scan QR').closest('a');
    expect(scanButton).toBeDefined();
    expect(scanButton?.getAttribute('href')).toBe('/scan');
  });

  test('Pay button has correct href for navigation', () => {
    render(<QuickActionsGrid />);
    
    const payButton = screen.getByText('Pay').closest('a');
    expect(payButton).toBeDefined();
    expect(payButton?.getAttribute('href')).toBe('/pay');
  });

  /**
   * Test hover states show Neon Green accents
   * Requirements: 2.5
   */
  test('buttons have Neon Green accent elements', () => {
    const { container } = render(<QuickActionsGrid />);
    
    // Find all SVG elements (icons) which should have Neon Green stroke
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(2);
    
    // Check that SVG icons have Neon Green stroke color
    svgElements.forEach((svg) => {
      const stroke = svg.getAttribute('stroke');
      expect(stroke).toBe('#CCFF00');
    });
  });

  test('buttons have hover state elements with Neon Green gradient', () => {
    const { container } = render(<QuickActionsGrid />);
    
    // Find hover state divs (they have radial-gradient with Neon Green)
    const links = container.querySelectorAll('a');
    
    links.forEach((link) => {
      // Each link should have a hover state div with Neon Green in the gradient
      const hoverDiv = link.querySelector('div[style*="radial-gradient"]');
      expect(hoverDiv).toBeDefined();
      
      const style = hoverDiv?.getAttribute('style');
      expect(style).toContain('rgba(204, 255, 0');
    });
  });

  /**
   * Test color values are correct
   * Requirements: 2.6
   */
  test('buttons have correct Card Surface background color', () => {
    const { container } = render(<QuickActionsGrid />);
    
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    
    links.forEach((link) => {
      const style = link.getAttribute('style');
      // Check for Card Surface color #18181B
      expect(style).toContain('background: rgb(24, 24, 27)');
    });
  });

  /**
   * Test border and border radius are correct
   * Requirements: 2.7, 2.8
   */
  test('buttons have correct Border Stroke color and width', () => {
    const { container } = render(<QuickActionsGrid />);
    
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    
    links.forEach((link) => {
      const style = link.getAttribute('style');
      // Check for 1px border with Border Stroke color #27272A
      expect(style).toContain('border: 1px solid rgb(39, 39, 42)');
    });
  });

  test('buttons have correct border radius', () => {
    const { container } = render(<QuickActionsGrid />);
    
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    
    links.forEach((link) => {
      const style = link.getAttribute('style');
      // Check for border radius of 24px (within 16-24px range)
      expect(style).toContain('border-radius: 24px');
    });
  });

  /**
   * Test grid layout and spacing
   * Requirements: 2.1
   */
  test('buttons are laid out in a grid with correct spacing', () => {
    const { container } = render(<QuickActionsGrid />);
    
    const gridContainer = container.querySelector('div[class*="grid"]');
    expect(gridContainer).toBeDefined();
    
    const style = gridContainer?.getAttribute('style');
    // Check for 24px gap (bento grid spacing)
    expect(style).toContain('gap: 24px');
  });

  /**
   * Test Inter font is used for button text
   * Requirements: 2.9
   */
  test('button text uses Inter font', () => {
    const { container } = render(<QuickActionsGrid />);
    
    const buttonTexts = container.querySelectorAll('span');
    expect(buttonTexts.length).toBeGreaterThanOrEqual(2);
    
    buttonTexts.forEach((span) => {
      const style = span.getAttribute('style');
      expect(style).toContain('font-family: Inter');
    });
  });
});
