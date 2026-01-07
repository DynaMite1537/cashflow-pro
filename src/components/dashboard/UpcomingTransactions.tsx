'use client';

import { memo, useMemo } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { matchesRecurrence } from '@/lib/dateUtils';
import { DailySimulationResult, SimulationTransaction } from '@/types';
import dayjs from 'dayjs';
import { Calendar, TrendingUp, TrendingDown, AlertCircle, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpcomingTransactionsProps {
  simulation?: DailySimulationResult[];
  days?: number; // Number of days to show (default: 14)
  onDateClick?: (date: Date) => void;
}

export const UpcomingTransactions = memo(function UpcomingTransactions({
  simulation = [],
  days = 14,
  onDateClick,
}: UpcomingTransactionsProps) {
  const { transactions, rules } = useBudgetStore();

  // Get next N days with transactions from simulation
  const upcomingDays = useMemo(() => {
    const today = dayjs().startOf('day');
    const endDate = today.add(days, 'day');

    return simulation
      .filter(day => {
        const dayDate = dayjs(day.date);
        return dayDate.isAfter(today) || dayDate.isSame(today);
      })
      .filter(day => day.transactions.length > 0)
      .sort((a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1)
      .slice(0, days);
  }, [simulation, days]) as DailySimulationResult[];

  const handleDayClick = (date: string) => {
    if (onDateClick) {
      onDateClick(new Date(date));
    }
  };

  const getTransactionIcon = (transaction: SimulationTransaction) => {
    if (transaction.isOverride) {
      return <AlertCircle size={14} className="text-amber-600" />;
    }
    if (transaction.source === 'rule') {
      return <Repeat size={14} className="text-muted-foreground" />;
    }
    return <Calendar size={14} className="text-muted-foreground" />;
  };

  if (upcomingDays.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-xl font-bold mb-4">Upcoming Transactions</h2>
        <div className="text-center text-muted-foreground py-8">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No upcoming transactions in the next {days} days</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Upcoming Transactions</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          <span>Next {days} days</span>
        </div>
      </div>

      <div className="space-y-4">
        {upcomingDays.map((day: DailySimulationResult) => {
          const isToday = dayjs(day.date).isSame(dayjs(), 'day');
          const isTomorrow = dayjs(day.date).isSame(dayjs().add(1, 'day'), 'day');
          const isNegative = day.endingBalance < 0;

          return (
            <div
              key={day.date}
              className={cn(
                'border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer',
                isToday && 'bg-primary/5 border-primary',
                isNegative && 'border-destructive/50 bg-destructive/5'
              )}
              onClick={() => handleDayClick(day.date)}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-semibold',
                    isToday ? 'text-primary' : 'text-foreground'
                  )}>
                    {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayjs(day.date).format('ddd, MMM D')}
                  </span>
                  {day.hasOverride && (
                    <AlertCircle size={14} className="text-amber-600" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Net Change */}
                  <div className="flex items-center gap-1">
                    {day.netChange >= 0 ? (
                      <TrendingUp size={14} className="text-emerald-600" />
                    ) : (
                      <TrendingDown size={14} className="text-destructive" />
                    )}
                    <span className={cn(
                      'text-xs font-mono font-semibold',
                      day.netChange >= 0 ? 'text-emerald-600' : 'text-destructive'
                    )}>
                      {day.netChange >= 0 ? '+' : ''}${day.netChange.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                {day.transactions.map((transaction: SimulationTransaction, idx: number) => {
                  const isIncome = transaction.type === 'income';
                  const isLast = idx === day.transactions.length - 1;

                  return (
                    <div
                      key={`${day.date}-${idx}`}
                      className={cn(
                        'flex items-center justify-between text-xs',
                        isLast || 'border-b border-border/50 pb-2'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getTransactionIcon(transaction)}
                        <span className="truncate text-foreground">
                          {transaction.name}
                        </span>
                      </div>
                      <span className={cn(
                        'font-mono font-medium flex-shrink-0 ml-2',
                        isIncome ? 'text-emerald-600' : 'text-destructive'
                      )}>
                        {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Day Balance */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Ending Balance</span>
                <span className={cn(
                  'text-sm font-mono font-bold',
                  isNegative ? 'text-destructive' : 'text-foreground'
                )}>
                  ${day.endingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <AlertCircle size={12} className="text-amber-600" />
          <span>Manual adjustment</span>
        </div>
        <div className="flex items-center gap-1">
          <Repeat size={12} />
          <span>Recurring rule</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-600" />
          <span>Positive change</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown size={12} className="text-destructive" />
          <span>Negative change</span>
        </div>
      </div>
    </div>
  );
});
