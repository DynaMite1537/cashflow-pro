'use client';

import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useBudgetStore, useTransactions } from '@/store/useBudgetStore';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const transactions = useTransactions();
  const [currentDate, setCurrentDate] = useState(new Date());
  
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

  const getTransactionsForDate = (date: Date) => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return dayjs(date).isSame(tDate, 'month') && date.getDate() === tDate.getDate();
    });
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

  // Get week day for the first day
  const firstDayOfWeek = monthStart.getDay();

  // Calculate days to pad at start
  const paddingDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View your transactions by date</p>
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
            const dayTransactions = getTransactionsForDate(day);
            const isToday = dayjs(day).isSame(new Date(), 'day');
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            const netAmount = dayTransactions.reduce((sum, t) => {
              return sum + (t.type === 'income' ? t.amount : -t.amount);
            }, 0);

            return (
              <div
                key={day.getDate()}
                className={cn(
                  'aspect-square rounded-lg border border-border p-2 transition-all hover:shadow-md',
                  isToday && 'bg-primary/10 border-primary',
                  isWeekend && 'bg-muted/20',
                  !isToday && 'bg-card hover:bg-muted/50'
                )}
              >
                <div className="flex flex-col h-full justify-between">
                  <span className={cn(
                    'text-sm font-medium',
                    isToday ? 'text-primary' : 'text-foreground'
                  )}>
                    {day.getDate()}
                  </span>

                  {dayTransactions.length > 0 && (
                    <div className="space-y-1">
                      {dayTransactions.slice(0, 3).map((t) => {
                        const isIncome = t.type === 'income';
                        return (
                          <div
                            key={t.id}
                            className={cn(
                              'text-xs truncate',
                              isIncome ? 'text-emerald-600' : 'text-destructive'
                            )}
                            title={t.description || ''}
                          >
                            {t.description ? (t.description || '').substring(0, 12) + (t.description.length > 12 ? '...' : '') : isIncome ? '+' : '-'}
                            {Math.abs(t.amount)}
                          </div>
                        );
                      })}
                      {dayTransactions.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{dayTransactions.length - 3} more</span>
                      )}
                    </div>
                  )}

                  {dayTransactions.length === 0 && (
                    <div className="text-xs text-muted-foreground font-mono text-center pt-1">
                      {netAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-600" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span>Expense</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
