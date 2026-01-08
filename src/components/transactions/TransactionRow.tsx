'use client';

import { Search, ArrowDownCircle, ArrowUpCircle, Trash2, Calendar } from 'lucide-react';
import { OneTimeTransaction } from '@/types';
import { formatCurrency } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

export interface TransactionRowDataProps {
  transactions: OneTimeTransaction[];
  onDelete: (id: string, description: string | null) => void;
  onToggleReconciled: (id: string, currentStatus: boolean) => void;
}

export function TransactionRow({
  index,
  style,
  transactions,
  onDelete,
  onToggleReconciled
}: {
  index: number;
  style: React.CSSProperties;
} & TransactionRowDataProps) {
  const transaction = transactions[index];
  const isIncome = transaction.type === 'income';

  return (
    <div style={style} className="border-b border-border hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-4 p-4">
        {/* Type Icon */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isIncome ? 'bg-emerald-500/10' : 'bg-destructive/10'
        )}>
          {isIncome ? (
            <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 text-destructive" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium truncate text-sm',
            isIncome ? 'text-foreground' : 'text-foreground'
          )}>
            {transaction.description || 'No description'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            {transaction.is_reconciled && (
              <span className="text-xs text-muted-foreground">• Reconciled</span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className={cn(
            'text-lg font-bold font-mono',
            isIncome ? 'text-emerald-600' : 'text-destructive'
          )}>
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleReconciled(transaction.id, transaction.is_reconciled)}
            className="p-2 hover:bg-accent rounded transition-colors"
            title="Toggle reconciled status"
          >
            <Calendar size={16} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(transaction.id, transaction.description)}
            className="p-2 hover:bg-destructive/10 rounded transition-colors text-destructive"
            title="Delete transaction"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
