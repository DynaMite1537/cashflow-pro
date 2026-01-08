'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { toastError } from '@/lib/toast';

interface Error {
  message: string;
  stack?: string;
}

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Application Error:', error);
    toastError('An error occurred', error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-md w-full space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Oops! Something went wrong</h1>
          <p className="text-muted-foreground">{error.message || 'An unexpected error occurred'}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              toastError('Retrying...', 'Attempting to recover from error');
              reset();
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-card text-foreground py-3 rounded-lg font-medium border border-border hover:bg-accent transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>

        {/* Stack Trace (development only) */}
        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              View Error Details
            </summary>
            <pre className="mt-2 p-4 bg-muted/50 rounded-md overflow-x-auto text-xs text-foreground">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
