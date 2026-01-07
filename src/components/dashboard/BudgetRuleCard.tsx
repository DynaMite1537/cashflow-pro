'use client';

import { memo } from 'react';
import { Pencil, Trash2, Calendar, DollarSign, ArrowUpCircle, ArrowDownCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { BudgetRule } from '@/types';
import { formatCurrency, getFrequencyLabel } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface BudgetRuleCardProps {
  rule: BudgetRule;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

export const BudgetRuleCard = memo(function BudgetRuleCard({ rule, onEdit, onDelete, onToggleActive }: BudgetRuleCardProps) {
  const isIncome = rule.type === 'income';
  const categoryColors: Record<string, string> = {
    housing: 'bg-[hsl(var(--category-housing))]/10 text-[hsl(var(--category-housing))] border-[hsl(var(--category-housing))/20]',
    transport: 'bg-[hsl(var(--category-transport))]/10 text-[hsl(var(--category-transport))] border-[hsl(var(--category-transport))/20]',
    utilities: 'bg-[hsl(var(--category-utilities))]/10 text-[hsl(var(--category-utilities))] border-[hsl(var(--category-utilities))/20]',
    food: 'bg-[hsl(var(--category-food))]/10 text-[hsl(var(--category-food))] border-[hsl(var(--category-food))/20]',
    entertainment: 'bg-[hsl(var(--category-entertainment))]/10 text-[hsl(var(--category-entertainment))] border-[hsl(var(--category-entertainment))/20]',
    debt: 'bg-[hsl(var(--category-debt))]/10 text-[hsl(var(--category-debt))] border-[hsl(var(--category-debt))/20]',
    subscription: 'bg-[hsl(var(--category-subscription))]/10 text-[hsl(var(--category-subscription))] border-[hsl(var(--category-subscription))/20]',
    other: 'bg-[hsl(var(--category-other))]/10 text-[hsl(var(--category-other))] border-[hsl(var(--category-other))/20]',
  };

  return (
    <div className={cn(
      'bg-card border rounded-lg p-5 hover:shadow-md transition-all relative group',
      !rule.is_active && 'opacity-60 grayscale-[50%]'
    )}>
      {/* Active Badge */}
      <div className="absolute top-3 right-3">
        <button
          onClick={onToggleActive}
          className={cn(
            'p-1.5 rounded-full transition-colors',
            rule.is_active ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'
          )}
          title={rule.is_active ? 'Active' : 'Inactive'}
        >
          {rule.is_active ? (
            <ToggleRight size={18} />
          ) : (
            <ToggleLeft size={18} />
          )}
        </button>
      </div>

      {/* Type Icon */}
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
        isIncome ? 'bg-emerald-500/10' : 'bg-destructive/10'
      )}>
        {isIncome ? (
          <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <ArrowDownCircle className="h-5 w-5 text-destructive" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base text-foreground">{rule.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {getFrequencyLabel(rule.frequency)}
              {rule.end_date && ` • Ends ${new Date(rule.end_date).toLocaleDateString()}`}
            </p>
          </div>
          <div className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium border',
            categoryColors[rule.category]
          )}>
            {rule.category}
          </div>
        </div>

        <div className="flex items-baseline gap-1 text-2xl font-bold">
          {isIncome ? '+' : '-'}
          {formatCurrency(rule.amount)}
        </div>

        {/* Recurrence Day */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
          <Calendar size={16} />
          {rule.frequency === 'monthly' && `Day ${rule.recurrence_day}`}
          {rule.frequency === 'weekly' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(rule.recurrence_day || 0) % 7]}
          {rule.frequency === 'bi-weekly' && 'Every 2 weeks'}
          {rule.frequency === 'yearly' && `Annually (${new Date(rule.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-border mt-4">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
        >
          <Pencil size={16} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
});
