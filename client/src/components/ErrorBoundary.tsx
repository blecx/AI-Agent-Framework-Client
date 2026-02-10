import type { ReactNode, ErrorInfo } from 'react';
import { Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional name to identify the boundary in logs */
  name?: string;
  /** Optional custom fallback UI */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const isDevelopment = import.meta.env.DEV;

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { name = 'Root' } = this.props;
    
    // Log to console (always in dev, minimal in prod)
    if (isDevelopment) {
      console.error(`[${name} ErrorBoundary] Unhandled React error:`, error);
      console.error('Component stack:', errorInfo.componentStack);
    } else {
      console.error(`[${name}] Error:`, error.message);
      // In production, you would send to error tracking service here
      // e.g., Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportIssue = () => {
    const { error, errorInfo } = this.state;
    const title = encodeURIComponent(
      `Bug: ${error?.message || 'Unexpected error'}`,
    );
    
    // Truncate stack traces to avoid URL length limits (browsers typically 2048-8192 chars)
    const truncate = (text: string | null | undefined, maxLength: number = 1000): string => {
      if (!text) return 'N/A';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '\n... (truncated)';
    };
    
    const body = encodeURIComponent(
      `## Error Details\n\n**Message:** ${error?.message}\n\n**Stack:**\n\`\`\`\n${truncate(error?.stack)}\n\`\`\`\n\n**Component Stack:**\n\`\`\`\n${truncate(errorInfo?.componentStack)}\n\`\`\`\n\n**Environment:** ${isDevelopment ? 'Development' : 'Production'}\n\n## Steps to Reproduce\n\n1. \n2. \n3. \n\n## Expected Behavior\n\n\n## Actual Behavior\n\n`,
    );
    const issueUrl = `https://github.com/blecx/AI-Agent-Framework-Client/issues/new?title=${title}&body=${body}&labels=bug`;
    window.open(issueUrl, '_blank', 'noopener,noreferrer');
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { fallback } = this.props;

      // Use custom fallback if provided
      if (fallback && error) {
        return fallback(error, this.handleReset);
      }

      // Default fallback UI
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <h2>Something went wrong</h2>
          <p>
            An unexpected error occurred. You can try again or reload the page.
          </p>
          <div className="error-boundary-actions">
            <button onClick={this.handleReset} type="button">
              Try again
            </button>
            <button onClick={this.handleReload} type="button">
              Reload page
            </button>
            <button onClick={this.handleReportIssue} type="button">
              Report issue
            </button>
          </div>
          {error?.message && (
            <div className="error-boundary-details">
              <strong>Error:</strong> {error.message}
            </div>
          )}
          {isDevelopment && error?.stack && (
            <details className="error-boundary-stack">
              <summary>Stack trace (dev only)</summary>
              <pre>{error.stack}</pre>
            </details>
          )}
          {isDevelopment && errorInfo?.componentStack && (
            <details className="error-boundary-component-stack">
              <summary>Component stack (dev only)</summary>
              <pre>{errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
