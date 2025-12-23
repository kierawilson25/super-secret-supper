# Error Boundary Documentation

## Overview

The ErrorBoundary component is a React class component that catches JavaScript errors anywhere in the child component tree, logs error details, and displays a fallback UI instead of crashing the entire application.

## Location

- **Component**: `/src/components/ErrorBoundary.tsx`
- **Export**: `/src/components/index.ts`
- **Implementation**: `/src/app/layout.tsx`

## Features

1. **Error Catching**: Catches JavaScript errors in child component tree
2. **Error Logging**: Uses the app's logger (`@/lib/logger`) to log errors with context
3. **User-Friendly UI**: Shows a styled error page matching the app's design (purple background, gold text)
4. **Recovery**: Provides a "Try Again" button to reset the error state
5. **Reusable**: Accepts optional `fallback` prop for custom error UI
6. **Development Mode**: Shows detailed error information in development
7. **Accessibility**: Includes ARIA labels and semantic HTML

## Compatibility

- Next.js 16.0.8
- React 19.2.0
- TypeScript 5
- Works with both App Router and Pages Router

## Basic Usage

### Default Fallback UI

```tsx
import { ErrorBoundary } from '@/components';

export default function Page() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Custom Fallback UI

```tsx
import { ErrorBoundary } from '@/components';

export default function Page() {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div>
          <h1>Custom Error</h1>
          <p>{error.message}</p>
          <button onClick={resetError}>Try Again</button>
        </div>
      )}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Implementation Details

### Global Implementation

The ErrorBoundary is implemented globally in the root layout:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Header />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### Component Structure

```tsx
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```

## Default Fallback UI

The default error UI includes:

1. **Error Icon**: Alert icon in gold color
2. **Title**: "Oops!" in Great Vibes font (gold)
3. **Message**: User-friendly error message
4. **Error Details**: Shown only in development mode
5. **Action Buttons**:
   - "Try Again": Resets the error boundary
   - "Go Home": Redirects to home page

### Styling

The error UI matches the app's design system:
- Background: `#460C58` (dark purple)
- Gold text: `#FBE6A6`
- Off-white text: `#F8F4F0`
- Hover gold: `#CFA94A`
- Fonts: Great Vibes (cursive) and Inter (sans-serif)

## Error Logging

Errors are logged using the app's logger with the following context:

```typescript
logger.error('React Error Boundary caught an error', {
  error: error.message,
  stack: error.stack,
  componentStack: errorInfo.componentStack,
  errorName: error.name,
});
```

### Production Logging

In production, you can integrate with error tracking services like:
- Sentry
- LogRocket
- Datadog
- Rollbar

Update the `componentDidCatch` method to send errors to your service:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  // Existing logging
  logger.error('React Error Boundary caught an error', { ... });

  // Add production error tracking
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }
}
```

## Advanced Usage

### Nested Error Boundaries

Use nested ErrorBoundaries to isolate errors to specific sections:

```tsx
export default function Page() {
  return (
    <ErrorBoundary>
      <Header />

      <ErrorBoundary fallback={(error, reset) => <SidebarError error={error} />}>
        <Sidebar />
      </ErrorBoundary>

      <ErrorBoundary fallback={(error, reset) => <ContentError error={error} />}>
        <MainContent />
      </ErrorBoundary>

      <Footer />
    </ErrorBoundary>
  );
}
```

### Per-Route Error Boundaries

Add ErrorBoundaries to specific routes:

```tsx
// app/dashboard/page.tsx
import { ErrorBoundary } from '@/components';

export default function DashboardPage() {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div className="dashboard-error">
          <h2>Dashboard Error</h2>
          <p>Failed to load dashboard: {error.message}</p>
          <button onClick={resetError}>Retry</button>
        </div>
      )}
    >
      <DashboardContent />
    </ErrorBoundary>
  );
}
```

## Limitations

### What Error Boundaries DON'T Catch

Error Boundaries do NOT catch errors in:

1. **Event handlers** (use try-catch)
2. **Asynchronous code** (setTimeout, requestAnimationFrame)
3. **Server-side rendering** (SSR)
4. **Errors in the Error Boundary itself**

### Event Handler Example

```tsx
// Error Boundaries won't catch this
function MyComponent() {
  const handleClick = () => {
    throw new Error('This will NOT be caught by ErrorBoundary');
  };

  return <button onClick={handleClick}>Click me</button>;
}

// Instead, use try-catch
function MyComponent() {
  const handleClick = () => {
    try {
      // Risky code
      riskyOperation();
    } catch (error) {
      logger.error('Event handler error', { error });
      // Handle error appropriately
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Async Error Example

```tsx
// Error Boundaries won't catch this
useEffect(() => {
  fetchData().then(data => {
    throw new Error('This will NOT be caught by ErrorBoundary');
  });
}, []);

// Instead, use try-catch
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchData();
      setData(data);
    } catch (error) {
      logger.error('Async error', { error });
      setError(error);
    }
  };

  loadData();
}, []);
```

## Testing

### Manual Testing

To test the ErrorBoundary, create a component that throws an error:

```tsx
'use client';

function BuggyComponent() {
  throw new Error('Test error');
  return <div>Never rendered</div>;
}

export default function TestPage() {
  return (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
}
```

### Conditional Error Testing

```tsx
'use client';

import { useState } from 'react';
import { ErrorBoundary } from '@/components';

function TestComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('User-triggered test error');
  }

  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
}

export default function TestPage() {
  return (
    <ErrorBoundary>
      <TestComponent />
    </ErrorBoundary>
  );
}
```

## Best Practices

1. **Strategic Placement**: Place ErrorBoundaries at strategic points in your component tree
2. **Granular Boundaries**: Use multiple ErrorBoundaries to isolate failures
3. **Meaningful Fallbacks**: Provide context-specific error messages
4. **Log Everything**: Ensure all errors are logged for debugging
5. **Recovery Mechanism**: Always provide a way for users to recover
6. **Production Tracking**: Integrate with error tracking services in production
7. **Test Thoroughly**: Test error scenarios in development

## Troubleshooting

### Error Boundary Not Catching Errors

**Problem**: Errors are not being caught by the ErrorBoundary.

**Solutions**:
1. Ensure the error occurs during render, not in event handlers or async code
2. Check that the component is a child of the ErrorBoundary
3. Verify the ErrorBoundary is a class component (not functional)
4. Make sure you're using 'use client' directive if needed

### Infinite Error Loop

**Problem**: Error Boundary keeps re-rendering with errors.

**Solutions**:
1. Check if the error occurs in the ErrorBoundary itself
2. Ensure the fallback UI doesn't throw errors
3. Verify resetError doesn't trigger the same error

### Error Not Logged

**Problem**: Errors are caught but not logged.

**Solutions**:
1. Check that logger is properly imported
2. Verify logger configuration
3. Check console in development mode
4. Verify production logging service configuration

## Future Enhancements

Potential improvements to consider:

1. **Error Analytics**: Track error frequency and patterns
2. **User Feedback**: Allow users to submit error reports
3. **Automatic Recovery**: Implement retry logic with exponential backoff
4. **Error Categorization**: Different UI for different error types
5. **Session Replay**: Integrate with tools like LogRocket for session replay
6. **A/B Testing**: Test different error recovery strategies

## Resources

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Logger Implementation](/src/lib/logger.ts)

## Support

For issues or questions about the ErrorBoundary implementation:
1. Check this documentation
2. Review the component source code
3. Check the browser console for error details
4. Review logged errors in development mode
