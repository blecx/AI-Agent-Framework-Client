import type { ReactNode } from 'react';
import { Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Unhandled React error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
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
              Reload
            </button>
          </div>
          {this.state.error?.message ? (
            <pre className="error-boundary-details">
              {this.state.error.message}
            </pre>
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}
