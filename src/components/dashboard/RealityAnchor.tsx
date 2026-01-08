'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { Pencil, Check, AlertTriangle, Loader2, CheckCircle, CloudOff } from 'lucide-react';
import { useBudgetStore, useCurrentBalance } from '@/store/useBudgetStore';
import { useSimulationStats } from '@/hooks/useSimulation';
import { formatCurrency } from '@/lib/dateUtils';
import { useSaveStatusDisplay } from '@/hooks/useAutoSave';

export const RealityAnchor = memo(function RealityAnchor() {
  const setBalance = useBudgetStore((state) => state.setBalance);
  const currentBalance = useCurrentBalance();
  const stats = useSimulationStats();
  const { status } = useSaveStatusDisplay();

  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(currentBalance.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempValue(currentBalance.toString());
  }, [currentBalance]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    const val = parseFloat(tempValue);
    if (!isNaN(val)) {
      setBalance(val);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6 flex flex-col justify-between relative overflow-hidden group">
      {/* Edit Button */}
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil size={18} />
        </button>
      </div>

      {/* Balance Display */}
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Current Reality
        </h2>
        <div className="flex items-baseline gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-muted-foreground">$</span>
              <input
                ref={inputRef}
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                onBlur={() => setIsEditing(false)}
                className="text-4xl font-bold bg-transparent border-b-2 border-primary focus:outline-none w-48 font-mono"
              />
              <button
                onClick={handleSave}
                className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90"
              >
                <Check size={20} />
              </button>
            </div>
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="text-5xl font-bold tracking-tight cursor-pointer hover:underline decoration-dashed decoration-muted-foreground/30 underline-offset-8"
            >
              {formatCurrency(currentBalance)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Last reconciled: <span className="font-medium text-foreground">Just now</span>
        </p>
      </div>

      {/* Risk Detection */}
      <div className="mt-6 pt-6 border-t border-border">
        {status === 'saving' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )}

        {stats.hasOverdraft && status !== 'saving' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-3 py-1 rounded-full text-xs font-bold border border-destructive/20">
              <AlertTriangle size={14} />
              Risk Detected
            </div>
            <span className="text-sm text-muted-foreground">
              Projected overdraft in <strong>{stats.daysUntilOverdraft} days</strong> (
              {stats.lowestBalanceDate})
            </span>
          </div>
        )}

        {!stats.hasOverdraft && status !== 'saving' && status !== 'saved' && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-emerald-600 font-semibold">✓</span>
            Safe for at least 90 days
          </span>
        )}

        {status === 'saved' && !stats.hasOverdraft && (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-destructive">
            <CloudOff size={16} />
            <span className="text-sm font-medium">Save failed</span>
          </div>
        )}
      </div>
    </div>
  );
});
