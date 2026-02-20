/**
 * ErrorBoundary Component
 * 
 * Catches rendering errors in child components and displays a fallback UI.
 * Logs errors to console for debugging.
 * 
 * Requirements: Error handling for component rendering errors
 */

"use client";

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary catches React rendering errors and displays a fallback UI
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise default fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="relative overflow-hidden"
          style={{
            background: "#18181B",
            border: "1px solid #27272A",
            borderRadius: "20px",
            padding: "24px",
          }}
        >
          <p
            className="text-center"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#FF4444", // Red for error
              marginBottom: "8px",
            }}
          >
            Something went wrong
          </p>
          <p
            className="text-center text-xs"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "#71717A", // Muted text
            }}
          >
            Please try refreshing the page
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
