import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report to error tracking service if configured
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error, errorInfo);
    }
  }

  handleReset = () => {
    const message = this.state.error?.message ?? '';
    const isChunkError =
      /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed|ChunkLoadError|error loading dynamically imported module/i.test(
        message,
      );

    if (isChunkError && typeof window !== 'undefined') {
      // Full reload fetches the latest HTML shell + current asset hashes.
      window.location.reload();
      return;
    }

    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg-app)' }}>
          <div className="surface p-8 rounded-xl max-w-md text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ background: 'oklch(0.65 0.18 25 / 0.12)', color: 'oklch(0.65 0.18 25)' }}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105"
              style={{
                background: 'var(--color-accent-base)',
                color: 'white',
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
