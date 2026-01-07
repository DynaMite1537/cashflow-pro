'use client';

import { LucideIcon, FileText, ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon size={40} className="text-muted-foreground" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>

      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoRules({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Budget Rules Yet"
      description="Create your first recurring income or expense rule to start forecasting your finances."
      action={{ label: 'Create First Rule', onClick: onCreate }}
    />
  );
}

export function NoTransactions({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={ClipboardList}
      title="No Transactions"
      description="Add one-time income or expenses to track irregular spending."
      action={{ label: 'Add Transaction', onClick: onAdd }}
    />
  );
}

export function OnboardingWelcome({ onImport, onManual, onDemo }: { 
  onImport: () => void; 
  onManual: () => void; 
  onDemo?: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">$</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome to CashFlow Pro</h1>
          <p className="text-xl text-muted-foreground">
            Forecast your financial future with confidence.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-6 text-left pt-8">
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-2">Predict Overdrafts</h3>
            <p className="text-sm text-muted-foreground">
              See exactly when your balance might go negative, before it happens.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-2">Plan Ahead</h3>
            <p className="text-sm text-muted-foreground">
              Visualize how big purchases will impact your future cash flow.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-2">Stay in Sync</h3>
            <p className="text-sm text-muted-foreground">
              Quick adjustments keep your forecast aligned with reality.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button
            onClick={onImport}
            className="px-8 py-4 bg-card border-2 border-border rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import from Excel
          </button>
          <button
            onClick={onManual}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md"
          >
            Start from Scratch
          </button>
        </div>

        {/* Demo Link */}
        {onDemo && (
          <button 
            onClick={onDemo}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Try with sample data
          </button>
        )}
      </div>
    </div>
  );
}
