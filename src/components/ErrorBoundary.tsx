'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary component to catch React errors gracefully
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * With custom fallback:
 * <ErrorBoundary fallback={(error, resetError) => <CustomError error={error} reset={resetError} />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging service
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorName: error.name,
    });

    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container">
          <style jsx>{`
            .error-boundary-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #460C58;
              padding: 2rem;
            }

            .error-boundary-content {
              max-width: 600px;
              text-align: center;
            }

            .error-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 2rem;
            }

            .error-icon svg {
              width: 100%;
              height: 100%;
              stroke: #FBE6A6;
              fill: none;
              stroke-width: 2;
            }

            .error-title {
              font-family: 'Great Vibes', cursive;
              font-size: 3.5rem;
              color: #FBE6A6;
              margin-bottom: 1rem;
            }

            .error-message {
              color: #F8F4F0;
              font-size: 1.2rem;
              line-height: 1.6;
              margin-bottom: 2rem;
            }

            .error-details {
              background-color: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(251, 230, 166, 0.3);
              border-radius: 8px;
              padding: 1rem;
              margin-bottom: 2rem;
              text-align: left;
            }

            .error-details-title {
              color: #FBE6A6;
              font-size: 0.9rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }

            .error-details-text {
              color: #F8F4F0;
              font-size: 0.85rem;
              font-family: monospace;
              word-break: break-word;
              white-space: pre-wrap;
              margin: 0;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }

            .btn {
              font-family: 'Inter', sans-serif;
              font-size: 1rem;
              padding: 0.75rem 2rem;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
              font-weight: 600;
            }

            .btn-primary {
              background-color: #FBE6A6;
              color: #460C58;
            }

            .btn-primary:hover {
              background-color: #CFA94A;
            }

            .btn-secondary {
              background-color: transparent;
              color: #FBE6A6;
              border: 2px solid #FBE6A6;
            }

            .btn-secondary:hover {
              background-color: rgba(251, 230, 166, 0.1);
            }

            @media (max-width: 640px) {
              .error-title {
                font-size: 2.5rem;
              }

              .error-message {
                font-size: 1rem;
              }

              .error-actions {
                flex-direction: column;
              }

              .btn {
                width: 100%;
              }
            }
          `}</style>

          <div className="error-boundary-content">
            <div className="error-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="error-title">Oops!</h1>

            <p className="error-message">
              Something went wrong. We&apos;ve been notified and are looking into it.
              Please try again or return to the home page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="error-details">
                <div className="error-details-title">Error Details (Development Only):</div>
                <p className="error-details-text">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="error-actions">
              <button
                onClick={this.resetError}
                className="btn btn-primary"
                aria-label="Try again"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary"
                aria-label="Go to home page"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
