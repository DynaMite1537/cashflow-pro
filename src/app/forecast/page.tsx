'use client';

import { useState } from 'react';
import { useSimulation, useSimulationStats } from '@/hooks/useSimulation';
import { useBudgetStore } from '@/store/useBudgetStore';
import { formatCurrency } from '@/lib/dateUtils';
import { getEventsForDate } from '@/lib/calendarUtils';
import { CalendarEvent } from '@/types';
import { RealityAnchor } from '@/components/dashboard/RealityAnchor';
import { QuickAddWidget } from '@/components/dashboard/QuickAddWidget';
import { HistoryControls } from '@/components/ui/HistoryControls';
import { BalanceChart } from '@/components/dashboard/BalanceChart';
import { UpcomingTransactions } from '@/components/dashboard/UpcomingTransactions';
import { ForecastStats } from '@/components/dashboard/ForecastStats';
import { DayEditModal } from '@/components/dashboard/DayEditModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import dayjs from 'dayjs';

export default function ForecastPage() {
  const { simulation } = useSimulation();
  const { transactions, rules } = useBudgetStore();
  const stats = useSimulationStats();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();



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
            events={getEventsForDate(selectedDate, transactions, rules)}
            onClose={() => setSelectedDate(null)}
            onBack={() => setSelectedDate(null)}
          />
        )}
     </div>
   );
 }
