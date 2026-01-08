'use client';

import { FileQuestion, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-8">
        <FileQuestion size={48} className="text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>

        {/* Suggestions */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Here are some things you can try:</p>
          <ul className="list-disc list-inside space-y-1 text-left mt-4">
            <li>Check the URL and try again</li>
            <li>Use the navigation to go to a valid page</li>
            <li>Try searching for what you&apos;re looking for</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
          <Link
            href="/forecast"
            className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-lg font-medium hover:bg-accent transition-colors"
          >
            <Search size={18} />
            Browse Forecast
          </Link>
        </div>
      </div>
    </div>
  );
}
