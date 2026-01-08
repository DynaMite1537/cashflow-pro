'use client';

import { memo, useState, useEffect } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { Undo2, Redo2 } from 'lucide-react';

export const HistoryControls = memo(function HistoryControls() {
  const [mounted, setMounted] = useState(false);
  const temporalState = useBudgetStore.temporal.getState();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use initial empty state on server to avoid hydration mismatch
  const displayState = mounted
    ? temporalState
    : {
        pastStates: [],
        futureStates: [],
        undo: () => {},
        redo: () => {},
      };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover border border-border shadow-lg rounded-full px-4 py-2 flex items-center gap-4 z-50">
      <button
        onClick={() => displayState.undo()}
        disabled={!mounted || displayState.pastStates.length === 0}
        className="flex items-center gap-2 text-sm hover:text-primary disabled:opacity-30 transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={16} />
        Undo
      </button>

      <div className="w-px h-4 bg-border" />

      <button
        onClick={() => displayState.redo()}
        disabled={!mounted || displayState.futureStates.length === 0}
        className="flex items-center gap-2 text-sm hover:text-primary disabled:opacity-30 transition-colors"
        title="Redo (Ctrl+Shift+Z)"
      >
        Redo
        <Redo2 size={16} />
      </button>
    </div>
  );
});
