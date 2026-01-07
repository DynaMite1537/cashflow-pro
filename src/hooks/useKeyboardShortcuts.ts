'use client';

import { useEffect } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const temporalState = useBudgetStore.temporal.getState();
      
      // Ctrl+Z or Cmd+Z for Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        temporalState.undo();
      }

      // Ctrl+Shift+Z or Cmd+Shift+Z for Redo
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'z' || event.key === 'Z')) {
        event.preventDefault();
        temporalState.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
