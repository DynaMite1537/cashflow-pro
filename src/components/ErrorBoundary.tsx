'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toastError } from '@/lib/toast';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Handle different types of errors
    if (error instanceof Error) {
      // Check if it's a chunk load error or rendering error
      if (error.name === 'ChunkLoadError') {
        return {
          hasError: true,
          error,
          errorInfo: 'Failed to load required code. Please refresh the page.',
        };
      }
      // Check for API errors (network issues)
      if (error.message?.includes('fetch')) {
        return {
          hasError: true,
          error,
          errorInfo: 'Unable to connect to the server. Please check your internet connection.',
        };
      }
      // Check for Supabase auth errors
      if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        return {
          hasError: true,
          error,
          errorInfo: 'Authentication error. Please sign in again.',
        };
      }
    }

    // Default error
    return {
      hasError: true,
      error,
      errorInfo: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    toastError('Something went wrong', 'An error occurred while rendering this page');
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.children !== this.props.children) {
      // When children change, clear error state
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
            </div>

            {/* Error Content */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>

              {this.state.errorInfo && (
                <p className="text-muted-foreground">{this.state.errorInfo}</p>
              )}

              {!this.state.errorInfo && (
                <p className="text-muted-foreground">
                  {this.state.error?.toString() ||
                    'An unexpected error occurred while rendering this page.'}
                </p>
              )}

              <div className="flex flex-col gap-3 items-center justify-center">
                <button
                  onClick={() => {
                    window.location.href = '/';
                    this.handleReset();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw size={18} />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={() => {
                    window.history.back();
                    this.handleReset();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-card text-card-foreground rounded-lg font-medium border border-border hover:bg-accent transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
