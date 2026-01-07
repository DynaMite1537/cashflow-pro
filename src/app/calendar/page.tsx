'use client';

import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Repeat, DollarSign, Pencil, Edit3, AlertCircle } from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { matchesRecurrence } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { BudgetRule, OneTimeTransaction } from '@/types';
import { DayEditModal } from '@/components/dashboard/DayEditModal';

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

export default function CalendarPage() {
  const { transactions, rules } = useBudgetStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = dayjs(currentDate).startOf('month').toDate();
  const monthEnd = dayjs(currentDate).endOf('month').toDate();

  const daysInMonth = useMemo(() => {
    const days = [];
    let day = new Date(monthStart);
    while (day <= monthEnd) {
      days.push(new Date(day));
      day = dayjs(day).add(1, 'day').toDate();
    }
    return days;
  }, [monthStart, monthEnd]);

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

    // Add override transactions (replacing the rules they override)
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

  // Check if a date has overrides
  const hasOverride = (date: Date): boolean => {
    const dayStr = dayjs(date).format('YYYY-MM-DD');
    return transactions.some(t =>
      t.is_override &&
      dayjs(t.date).format('YYYY-MM-DD') === dayStr
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get week day for first day
  const firstDayOfWeek = monthStart.getDay();

  // Calculate days to pad at start
  const paddingDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View your transactions and recurring rules</p>
        </div>
      </div>

      {/* Calendar Control */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">
              {dayjs(currentDate).format('MMMM YYYY')}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <span className="font-medium">
                {dayjs(currentDate).add(1, 'month').format('MMMM YYYY')}
              </span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Padding days from previous month */}
          {paddingDays.map((_, i) => (
            <div
              key={`pad-${i}`}
              className="aspect-square rounded-lg"
            />
          ))}

          {/* Actual days */}
          {daysInMonth.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isToday = dayjs(day).isSame(new Date(), 'day');
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const dayHasOverride = hasOverride(day);

            const incomeEvents = dayEvents.filter(e => e.transactionType === 'income');
            const expenseEvents = dayEvents.filter(e => e.transactionType === 'expense');
            const netAmount = dayEvents.reduce((sum, e) => sum + (e.transactionType === 'income' ? e.amount : -e.amount), 0);

            return (
              <div
                key={day.getDate()}
                className={cn(
                  'aspect-square rounded-lg border border-border p-2 transition-all hover:shadow-md cursor-pointer relative group',
                  isToday && 'bg-primary/10 border-primary',
                  isWeekend && 'bg-muted/20',
                  !isToday && 'bg-card hover:bg-muted/50'
                )}
                onClick={() => setSelectedDate(day)}
              >
                {/* Edit button (hover) */}
                <button
                  className="absolute top-1 right-1 z-10 p-1 bg-primary/80 hover:bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(day);
                  }}
                  title="Edit day"
                >
                  <Pencil size={10} className="text-primary-foreground" />
                </button>

                <div className="flex flex-col h-full justify-between pt-2">
                  <div className="space-y-1">
                    <span className={cn(
                      'text-sm font-medium',
                      isToday ? 'text-primary' : 'text-foreground'
                    )}>
                      {day.getDate()}
                    </span>

                    {/* Override indicator underneath calendar number */}
                    {dayHasOverride && (
                      <div
                        className="flex items-center gap-1 text-amber-600"
                        title="This day has manual adjustments"
                      >
                        <Edit3 size={10} />
                        <span className="text-xs font-semibold">Override</span>
                      </div>
                    )}
                  </div>

                  {dayEvents.length > 0 && (
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => {
                        const isIncome = event.transactionType === 'income';
                        const isRule = event.type === 'rule';
                        const isOverride = event.isOverride;

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              'text-xs truncate flex items-center gap-1',
                              isIncome ? 'text-emerald-600' : 'text-destructive',
                              isOverride && 'font-semibold'
                            )}
                            title={`${event.name} - ${isIncome ? '+' : '-'}${event.amount.toFixed(2)}`}
                          >
                            {isOverride && <AlertCircle size={10} className="text-amber-600" />}
                            {isRule && !isOverride && <Repeat size={10} className="opacity-60" />}
                            <span>
                              {event.name.substring(0, 10)}{event.name.length > 10 ? '...' : ''}
                            </span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {dayEvents.length === 0 && (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-mono pt-1 opacity-50">
                      <DollarSign size={10} />
                      <span>0.00</span>
                    </div>
                  )}

                  {/* Net amount indicator for days with events */}
                  {dayEvents.length > 0 && (
                    <div className={cn(
                      'text-xs font-mono text-center border-t border-border/50 pt-0.5',
                      netAmount >= 0 ? 'text-emerald-600' : 'text-destructive'
                    )}>
                      {netAmount >= 0 ? '+' : ''}{netAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span>Expense</span>
        </div>
        <div className="flex items-center gap-2">
          <Repeat size={14} className="opacity-60" />
          <span>Recurring Rule</span>
        </div>
        <div className="flex items-center gap-2">
          <Edit3 size={14} className="text-amber-600" />
          <span>Override</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary" />
          <span>Today</span>
        </div>
      </div>

      {/* Day Edit Modal */}
      {selectedDate && (
        <DayEditModal
          date={selectedDate}
          events={getEventsForDate(selectedDate)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
