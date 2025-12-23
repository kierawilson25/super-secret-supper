'use client';

/**
 * Example usage of ErrorBoundary component
 *
 * This file demonstrates how to use the ErrorBoundary in different scenarios.
 * DO NOT import this file in production - it's for demonstration only.
 */

import { useState } from 'react';
import ErrorBoundary from '../ErrorBoundary';

// Example 1: Component that throws an error
function BuggyComponent() {
  throw new Error('This is a test error from BuggyComponent');
  return <div>This will never render</div>;
}

// Example 2: Component with conditional error
function ConditionalErrorComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('User triggered error!');
  }

  return (
    <div>
      <button onClick={() => setShouldError(true)}>
        Trigger Error
      </button>
    </div>
  );
}

// Example 3: Using ErrorBoundary with default fallback
export function Example1() {
  return (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
}

// Example 4: Using ErrorBoundary with custom fallback
export function Example2() {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Custom Error UI</h2>
          <p>Error: {error.message}</p>
          <button onClick={resetError}>Reset</button>
        </div>
      )}
    >
      <ConditionalErrorComponent />
    </ErrorBoundary>
  );
}

// Example 5: Nested ErrorBoundaries for granular error handling
export function Example3() {
  return (
    <ErrorBoundary>
      <div>
        <h1>App Container</h1>

        <ErrorBoundary>
          <div>
            <h2>Section 1</h2>
            <BuggyComponent />
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div>
            <h2>Section 2 (This still works!)</h2>
            <p>This section is isolated and won&apos;t crash if Section 1 errors</p>
          </div>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}
