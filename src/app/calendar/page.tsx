'use client';

import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Repeat, Pencil, Edit3, AlertCircle } from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { matchesRecurrence } from '@/lib/dateUtils';
import { getEventsForDate } from '@/lib/calendarUtils';
import { CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';
import { DayEditModal } from '@/components/dashboard/DayEditModal';

// Custom Tooltip Component
function EventTooltip({ event, children }: {
  event: CalendarEvent;
  children: React.ReactNode;
}) {
  const isIncome = event.transactionType === 'income';
  const isRule = event.type === 'rule';
  const isOverride = event.isOverride;

  return (
    <div className="relative group">
      {children}

      {/* Tooltip - appears on hover */}
      <div className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-3 py-2 bg-popover text-popover-foreground
        text-xs rounded-lg shadow-lg whitespace-nowrap
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 ease-out
        transform translate-y-1 group-hover:translate-y-0
        z-20 min-w-[140px] text-left pointer-events-none
      ">
        {/* Event name */}
        <div className="font-medium mb-1 truncate max-w-[200px]">
          {event.name}
        </div>

        {/* Amount */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className={isIncome ? 'text-emerald-600' : 'text-destructive'}>
            {isIncome ? '+' : '-'}${event.amount.toFixed(2)}
          </span>
          {isRule && <Repeat size={12} className="opacity-60" />}
          {isOverride && <AlertCircle size={12} className="text-amber-600" />}
        </div>

        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-popover" />
      </div>
    </div>
  );
}

// Mobile Event Dots (2×3 grid, max 6 dots)
function MobileEventDots({ events }: {
  events: CalendarEvent[];
}) {
  // Show up to 6 dots in 2×3 grid
  const displayDots = events.slice(0, 6);
  const hasMore = events.length > 6;

  return (
    <div className="flex flex-col items-center gap-1.5 w-full py-1">
      {/* Dots grid: 2 rows × 3 columns */}
      <div className="grid grid-cols-3 gap-1.5 justify-center w-full">
        {displayDots.map((event) => {
          const isIncome = event.transactionType === 'income';
          return (
            <EventTooltip key={event.id} event={event}>
              <div className={cn(
                'w-1.5 h-1.5 rounded-full transition-transform duration-150 group-hover:scale-125',
                isIncome ? 'bg-emerald-600' : 'bg-destructive'
              )} />
            </EventTooltip>
          );
        })}

        {/* More indicator */}
        {hasMore && (
          <EventTooltip
            event={{
              name: `${events.length - 6} more events`,
              amount: 0,
              transactionType: 'expense',
              type: 'transaction',
              id: 'more',
            }}
          >
            <div className="flex items-center justify-center w-1.5 h-1.5 text-[8px] text-muted-foreground">
              ...
            </div>
          </EventTooltip>
        )}
      </div>

      {/* Count badge */}
      <div className="text-[10px] text-muted-foreground font-medium">
        ...+{events.length}
      </div>
    </div>
  );
}

// Tablet Event List (2 events)
function TabletEventList({ events }: {
  events: CalendarEvent[];
}) {
  const displayEvents = events.slice(0, 2);
  const remaining = Math.max(0, events.length - 2);

  return (
    <div className="space-y-0.5">
      {displayEvents.map((event) => (
        <div key={event.id} className={cn(
          'text-xs truncate flex items-center gap-1',
          event.transactionType === 'income' ? 'text-emerald-600' : 'text-destructive',
          event.isOverride && 'font-semibold'
        )}>
          {event.isOverride && <AlertCircle size={8} className="text-amber-600" />}
          {event.type === 'rule' && !event.isOverride && <Repeat size={8} className="opacity-60" />}
          <span className="truncate max-w-[120px]">
            {event.name.substring(0, 10)}{event.name.length > 10 ? '...' : ''}
          </span>
        </div>
      ))}

      {remaining > 0 && (
        <div className="text-xs text-muted-foreground truncate">
          ...+{remaining}
        </div>
      )}
    </div>
  );
}

// Desktop Event List (3 events)
function DesktopEventList({ events }: {
  events: CalendarEvent[];
}) {
  const displayEvents = events.slice(0, 3);
  const remaining = Math.max(0, events.length - 3);

  return (
    <div className="space-y-0.5">
      {displayEvents.map((event) => (
        <div key={event.id} className={cn(
          'text-xs truncate flex items-center gap-1',
          event.transactionType === 'income' ? 'text-emerald-600' : 'text-destructive',
          event.isOverride && 'font-semibold'
        )}>
          {event.isOverride && <AlertCircle size={10} className="text-amber-600" />}
          {event.type === 'rule' && !event.isOverride && <Repeat size={10} className="opacity-60" />}
          <span className="truncate max-w-[160px]">
            {event.name.substring(0, 12)}{event.name.length > 12 ? '...' : ''}
          </span>
        </div>
      ))}

      {remaining > 0 && (
        <div className="text-xs text-muted-foreground truncate">
          ...+{remaining}
        </div>
      )}
    </div>
  );
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
            const dayEvents = getEventsForDate(day, transactions, rules);
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
                  'min-h-[50px] rounded-lg border border-border p-2 relative flex flex-col',
                  isToday && 'bg-primary/10 border-primary',
                  isWeekend && 'bg-muted/20',
                  !isToday && 'bg-card hover:bg-muted/50'
                )}
                onClick={() => setSelectedDate(day)}
              >
                {/* Edit button (hover) */}
                <button
                  className="absolute top-1 right-1 z-10 p-1 bg-primary/80 hover:bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(day);
                  }}
                  title="Edit day"
                >
                  <Pencil size={10} className="text-primary-foreground" />
                </button>

                {/* Day number with override icon */}
                <div className="flex items-center justify-center pt-1">
                  <span className={cn(
                    'text-sm font-medium relative inline-block',
                    isToday ? 'text-primary' : 'text-foreground'
                  )}>
                    {day.getDate()}

                    {/* Override: Icon only, no background */}
                    {dayHasOverride && (
                      <Edit3
                        size={12}
                        className="absolute -top-1.5 -right-2.5 text-amber-600"
                      />
                    )}
                  </span>
                </div>

                {/* Events display - flex-1 to fill available space */}
                <div className="flex-1 flex flex-col justify-center min-h-0">
                  {/* Empty state: nothing (for all breakpoints) */}
                  {dayEvents.length === 0 && null}

                {/* Mobile: Dot display */}
                {dayEvents.length > 0 && (
                  <div className="block md:hidden mt-1">
                    <MobileEventDots events={dayEvents} />
                  </div>
                )}

                  {/* Tablet: 2 events */}
                  {dayEvents.length > 0 && (
                    <div className="hidden md:block lg:hidden">
                      <TabletEventList events={dayEvents} />
                    </div>
                  )}

                  {/* Desktop: 3 events */}
                  {dayEvents.length > 0 && (
                    <div className="hidden lg:block">
                      <DesktopEventList events={dayEvents} />
                    </div>
                  )}
                </div>

                {/* Net amount at bottom - tablet/desktop only */}
                {dayEvents.length > 0 && (
                  <div className={cn(
                    'text-xs font-mono text-center border-t border-border/50 pt-0.5 hidden md:block pb-1',
                    netAmount >= 0 ? 'text-emerald-600' : 'text-destructive'
                  )}>
                    {netAmount >= 0 ? '+' : '-'}${Math.abs(netAmount).toFixed(2)}
                  </div>
                )}
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
          events={getEventsForDate(selectedDate, transactions, rules)}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
