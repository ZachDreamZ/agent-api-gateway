import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from './Brand';
import { reportError } from '../lib/error-reporter';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    reportError(error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="relative min-h-screen flex flex-col items-center justify-center px-5 text-center"
          style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
        >
          <LogoMark className="w-9 h-9 mb-5" style={{ color: 'var(--color-accent-base)' }} />
          <h1 className="text-display-sm mb-2">Something went sideways</h1>
          <p className="text-sm max-w-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            An unexpected error occurred while rendering this page. Your API keys and data are safe —
            try reloading, or head back to the home page.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn btn-primary text-sm"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <Link to="/" className="btn btn-secondary text-sm">
              Back to home
            </Link>
          </div>
          {import.meta.env.DEV && (
            <pre
              className="mt-8 max-w-lg text-left text-xs overflow-auto rounded-lg p-4"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-border-default)',
              }}
            >
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
