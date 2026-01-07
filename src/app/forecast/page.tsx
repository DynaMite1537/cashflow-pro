'use client';

import { useState } from 'react';
import { useSimulation, useSimulationStats } from '@/hooks/useSimulation';
import { useBudgetStore } from '@/store/useBudgetStore';
import { formatCurrency } from '@/lib/dateUtils';
import { matchesRecurrence } from '@/lib/dateUtils';
import { RealityAnchor } from '@/components/dashboard/RealityAnchor';
import { QuickAddWidget } from '@/components/dashboard/QuickAddWidget';
import { HistoryControls } from '@/components/ui/HistoryControls';
import { BalanceChart } from '@/components/dashboard/BalanceChart';
import { UpcomingTransactions } from '@/components/dashboard/UpcomingTransactions';
import { ForecastStats } from '@/components/dashboard/ForecastStats';
import { DayEditModal } from '@/components/dashboard/DayEditModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import dayjs from 'dayjs';

interface CalendarEvent {
  type: 'transaction' | 'rule';
  name: string;
  amount: number;
  transactionType: 'income' | 'expense';
  id: string;
  ruleId?: string;
  isOverride?: boolean;
  originalAmount?: number;
}

export default function ForecastPage() {
  const { simulation } = useSimulation();
  const { transactions, rules } = useBudgetStore();
  const stats = useSimulationStats();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Get all events for a specific date (one-time transactions + recurring rules)
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const dayStr = dayjs(date).format('YYYY-MM-DD');

    // Get all override transactions for this date
    const overrideTransactions = transactions.filter(t =>
      t.is_override &&
      dayjs(t.date).format('YYYY-MM-DD') === dayStr
    );

    // Track rule IDs that have overrides
    const overriddenRuleIds = new Set(overrideTransactions.map(t => t.override_rule_id).filter(Boolean) as string[]);

    // Add one-time transactions (non-override)
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return !t.is_override &&
             dayjs(date).isSame(tDate, 'month') &&
             date.getDate() === tDate.getDate();
    });

    dayTransactions.forEach(t => {
      events.push({
        type: 'transaction',
        name: t.description || 'Transaction',
        amount: t.amount,
        transactionType: t.type,
        id: t.id,
      });
    });

    // Add matching recurring rules (only active and not overridden)
    const matchingRules = rules.filter(rule =>
      rule.is_active &&
      !overriddenRuleIds.has(rule.id) &&
      matchesRecurrence(date, rule)
    );

    matchingRules.forEach(rule => {
      events.push({
        type: 'rule',
        name: rule.name,
        amount: rule.amount,
        transactionType: rule.type,
        id: rule.id,
      });
    });

    // Add override transactions (replacing rules they override)
    overrideTransactions.forEach(t => {
      if (t.override_rule_id) {
        const rule = rules.find(r => r.id === t.override_rule_id);
        events.push({
          type: 'rule',
          name: t.description || (rule?.name || 'Override'),
          amount: t.amount,
          transactionType: t.type,
          id: t.id,
          ruleId: t.override_rule_id,
          isOverride: true,
          originalAmount: rule?.amount,
        });
      }
    });

    return events;
  };

  const handleDotClick = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Forecast</h1>
          <p className="text-muted-foreground mt-1">90-day projection</p>
        </div>
      </div>

      {/* Top Section with RealityAnchor and QuickAdd */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <RealityAnchor />
        </div>
        <div>
          <QuickAddWidget />
        </div>
      </div>

      {/* Enhanced Stats */}
      <ForecastStats simulation={simulation} />

       {/* Chart - Recharts */}
       <div className="bg-card border border-border rounded-xl p-8 mb-8">
         <h2 className="text-xl font-bold mb-6">Balance Projection</h2>
         <BalanceChart data={simulation} onDotClick={handleDotClick} />
       </div>

       {/* Upcoming Transactions */}
       <UpcomingTransactions simulation={simulation} days={14} onDateClick={handleDotClick} />

       {/* History Controls */}
       <HistoryControls />

       {/* Day Edit Modal */}
       {selectedDate && (
         <DayEditModal
           date={selectedDate}
           events={getEventsForDate(selectedDate)}
           onClose={() => setSelectedDate(null)}
           onBack={() => setSelectedDate(null)}
         />
       )}
     </div>
   );
 }
