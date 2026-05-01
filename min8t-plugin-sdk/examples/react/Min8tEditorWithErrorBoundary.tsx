/**
 * min8tEmail Plugin SDK - React Error Boundary Wrapper
 *
 * Production-ready error boundary implementation for the Min8tEditor component.
 * Uses react-error-boundary package for modern React 18 error handling.
 *
 * @packageDocumentation
 * @version 1.0.0
 * @author min8t Team
 * @license MIT
 *
 * **Features:**
 * - Graceful error handling for plugin failures
 * - User-friendly error fallback UI
 * - Error logging to external services (optional)
 * - Reset functionality to recover from errors
 * - TypeScript support
 *
 * **Based on Research:**
 * - Error boundary best practices: https://github.com/bvaughn/react-error-boundary
 * - React error handling: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Min8tEditor, Min8tEditorProps } from './Min8tEditor';

/**
 * Error Fallback Component
 *
 * Displayed when the Min8tEditor component encounters an error
 */
const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div
      role="alert"
      style={{
        padding: '24px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <h2 style={{ margin: '0 0 12px', color: '#c33' }}>
        ⚠️ Email Editor Error
      </h2>
      <p style={{ margin: '0 0 16px', color: '#666' }}>
        The email editor encountered an unexpected error and could not load.
      </p>
      <details style={{ marginBottom: '16px' }}>
        <summary style={{ cursor: 'pointer', color: '#666' }}>
          Technical Details
        </summary>
        <pre
          style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px',
            color: '#333'
          }}
        >
          {error.message}
        </pre>
      </details>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Try Again
      </button>
    </div>
  );
};

/**
 * Error Handler for Logging
 *
 * This function is called when an error is caught by the error boundary.
 * Use this to log errors to external services (Sentry, LogRocket, etc.)
 */
const handleError = (error: Error, info: { componentStack: string }) => {
  // Log to console in development
  console.error('[Min8tEditor Error Boundary]', error, info);

  // TODO: Log to external error tracking service
  // Example with Sentry:
  // Sentry.captureException(error, {
  //   contexts: {
  //     react: {
  //       componentStack: info.componentStack
  //     }
  //   }
  // });

  // Example with LogRocket:
  // LogRocket.captureException(error, {
  //   extra: {
  //     componentStack: info.componentStack
  //   }
  // });
};

/**
 * Min8tEditor with Error Boundary
 *
 * Wraps the Min8tEditor component with an error boundary for production-ready
 * error handling. This prevents the entire app from crashing if the plugin fails.
 *
 * @example
 * ```tsx
 * <Min8tEditorWithErrorBoundary
 *   pluginId="min8t_pk_your_plugin_id"
 *   emailId="email-456"
 *   authToken="your-es-plugin-auth-token"
 *   onSave={(result) => console.log('Saved:', result)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 * ```
 */
export const Min8tEditorWithErrorBoundary: React.FC<Min8tEditorProps> = (props) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset any state that might have caused the error
        console.log('[Min8tEditor] Error boundary reset');
      }}
    >
      <Min8tEditor {...props} />
    </ErrorBoundary>
  );
};

export default Min8tEditorWithErrorBoundary;
