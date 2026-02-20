/**
 * Tests for ErrorBoundary component
 * 
 * Tests error handling and fallback rendering for component errors.
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './error-boundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary - Error Handling Tests', () => {
  /**
   * Test error boundary catches rendering errors
   * Requirements: 1.2, 3.9
   */
  test('catches rendering error and displays fallback UI', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify fallback UI is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please try refreshing the page')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Verify children are rendered normally
    expect(screen.getByText('No error')).toBeInTheDocument();
    
    // Verify fallback UI is not displayed
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  /**
   * Test error logging
   */
  test('logs error to console when error is caught', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify console.error was called
    expect(consoleSpy).toHaveBeenCalled();
    
    // Verify error message includes our test error
    const errorCalls = consoleSpy.mock.calls;
    const hasErrorMessage = errorCalls.some(call => 
      call.some(arg => arg && arg.toString && arg.toString().includes('Test error'))
    );
    expect(hasErrorMessage).toBe(true);

    consoleSpy.mockRestore();
  });

  /**
   * Test fallback UI styling
   */
  test('fallback UI has correct Card Surface background', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const fallbackCard = container.firstChild as HTMLElement;
    expect(fallbackCard).toHaveStyle({ background: '#18181B' });

    consoleSpy.mockRestore();
  });

  test('fallback UI has correct Border Stroke', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const fallbackCard = container.firstChild as HTMLElement;
    const style = fallbackCard.getAttribute('style');
    expect(style).toContain('border');
    expect(style).toContain('1px solid');

    consoleSpy.mockRestore();
  });

  test('fallback UI has correct border radius', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const fallbackCard = container.firstChild as HTMLElement;
    expect(fallbackCard).toHaveStyle({ borderRadius: '20px' });

    consoleSpy.mockRestore();
  });

  test('fallback UI uses Inter font', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorText = screen.getByText('Something went wrong');
    const style = errorText.getAttribute('style');
    expect(style).toContain('"Inter"');

    consoleSpy.mockRestore();
  });

  test('fallback UI displays error message in red', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorText = screen.getByText('Something went wrong');
    expect(errorText).toHaveStyle({ color: '#FF4444' });

    consoleSpy.mockRestore();
  });

  test('fallback UI displays helper text in muted color', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const helperText = screen.getByText('Please try refreshing the page');
    expect(helperText).toHaveStyle({ color: '#71717A' });

    consoleSpy.mockRestore();
  });

  /**
   * Test custom fallback prop
   */
  test('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify custom fallback is displayed
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    
    // Verify default fallback is not displayed
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  /**
   * Test multiple children
   */
  test('renders multiple children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  test('catches error from any child in multiple children', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <ThrowError shouldThrow={true} />
        <div>Child 3</div>
      </ErrorBoundary>
    );

    // Verify fallback UI is displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Verify children are not displayed
    expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Child 3')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  /**
   * Test error boundary maintains card structure
   */
  test('maintains card structure in fallback UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const fallbackCard = container.firstChild as HTMLElement;
    
    // Verify card structure is maintained
    expect(fallbackCard).toBeInTheDocument();
    expect(fallbackCard.className).toContain('relative');
    expect(fallbackCard.className).toContain('overflow-hidden');

    consoleSpy.mockRestore();
  });
});
